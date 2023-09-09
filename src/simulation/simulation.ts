import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  combineLatest,
  interval
} from "rxjs"
import { switchMap, tap, map, scan, startWith } from "rxjs/operators"
import Fox from "../models/Fox"
import Plant from "../models/Plant"
import Rabbit from "../models/Rabbit"
import SimulationSubscriptions from "../models/SimulationSubscriptions"
import { generateRandomEntities, getSexCount } from "../utils/functions"
import { getAnimalMovements$, getCanvasClicks$, handleRandomPlantGenerator } from "../utils/observables"
import Canvas from "../models/Canvas"

// offsprings
const plantOffspringsSubject = new Subject<number>()
const rabbitOffspringsSubject = new Subject<number>()
const foxOffspringsSubject = new Subject<number>()
const plantOffsprings$ = plantOffspringsSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))
const rabbitOffsprings$ = rabbitOffspringsSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))
const foxOffsprings$ = foxOffspringsSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))

// deceased
const plantDeceasedSubject = new Subject<number>()
const rabbitDeceasedSubject = new Subject<number>()
const foxDeceasedSubject = new Subject<number>()
const plantDeceased$ = plantDeceasedSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))
const rabbitDeceased$ = rabbitDeceasedSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))
const foxDeceased$ = foxDeceasedSubject.pipe(scan((acc, curr) => acc + curr, 0), startWith(0))

export default function startSimulation(plantsCount: number, rabbitsCount: number, foxesCount: number, simulationSpeedSubject: Observable<number>, simulationStateSubject: Observable<boolean>) {

  const frames$ = combineLatest([simulationSpeedSubject, simulationStateSubject]).pipe(
    switchMap(([speed, isRunning]) => {
      if (isRunning) {
        return interval(speed)
      } else {
        return EMPTY
      }
    })
  )

  const plants = generateRandomEntities(plantsCount, () => new Plant(Math.random() * Canvas.canvas.width, Math.random() * Canvas.canvas.height))
  const rabbits = generateRandomEntities(rabbitsCount, () => new Rabbit(Math.random() * Canvas.canvas.width, Math.random() * Canvas.canvas.height, false))
  const foxes = generateRandomEntities(foxesCount, () => new Fox(Math.random() * Canvas.canvas.width, Math.random() * Canvas.canvas.height, false))

  const plantsSubject = new BehaviorSubject<Plant[]>(plants)
  const rabbitsSubject = new BehaviorSubject<Rabbit[]>(rabbits)
  const foxesSubject = new BehaviorSubject<Fox[]>(foxes)

  const animalCountDiv: HTMLElement = document.getElementById('animalCount')
  const plantGraphBar: HTMLElement = document.getElementById('plantGraph')
  const rabbitMaleGraphBar: HTMLElement = document.getElementById('rabbitGraphMale')
  const rabbitFemaleGraphBar: HTMLElement = document.getElementById('rabbitGraphFemale')
  const foxMaleGraphBar: HTMLElement = document.getElementById('foxGraphMale')
  const foxFemaleGraphBar: HTMLElement = document.getElementById('foxGraphFemale')

  const animalCountSubscription = combineLatest([plantsSubject, rabbitsSubject, foxesSubject])
    .pipe(
      map(([plants, rabbits, foxes]) => {
        const [rabbitMaleCount, rabbitFemaleCount] = getSexCount(rabbits)
        const [foxMaleCount, foxFemaleCount] = getSexCount(foxes)

        return ([
          plants.length,
          rabbits,
          rabbitMaleCount, rabbitFemaleCount,
          foxes,
          foxMaleCount, foxFemaleCount])
      }),
      tap(([plantCount, rabbits, rabbitMaleCount, rabbitFemaleCount, foxes, foxMaleCount, foxFemaleCount]) => {
        animalCountDiv.innerHTML = `Plants: ${plantCount} | Rabbits: ${(rabbits as Rabbit[]).length} | Foxes: ${(foxes as Fox[]).length}`

        plantGraphBar.style.height = `${plantCount}px`
        if ((plantCount as number) >= 15) { plantGraphBar.innerHTML = `${plantCount}` }
        else { plantGraphBar.innerHTML = '' }

        const realRabbitMaleCount = (rabbits as Rabbit[]).filter(rabbit => rabbit.sex).length
        const realRabbitFemaleCount = (rabbits as Rabbit[]).length - realRabbitMaleCount

        rabbitMaleGraphBar.style.height = `${rabbitMaleCount}px`
        if ((realRabbitMaleCount as number) >= 15) { rabbitMaleGraphBar.innerHTML = `${realRabbitMaleCount}` }
        else { rabbitMaleGraphBar.innerHTML = '' }
        rabbitFemaleGraphBar.style.height = `${rabbitFemaleCount}px`
        if ((realRabbitFemaleCount as number) >= 15) { rabbitFemaleGraphBar.innerHTML = `${realRabbitFemaleCount}` }
        else { rabbitFemaleGraphBar.innerHTML = '' }

        const realFoxMaleCount = (foxes as Fox[]).filter(fox => fox.sex).length
        const realFoxFemaleCount = (foxes as Fox[]).length - realFoxMaleCount

        foxMaleGraphBar.style.height = `${foxMaleCount}px`
        if ((realFoxMaleCount as number) >= 15) { foxMaleGraphBar.innerHTML = `${realFoxMaleCount}` }
        else { foxMaleGraphBar.innerHTML = '' }
        foxFemaleGraphBar.style.height = `${foxFemaleCount}px`
        if ((realFoxFemaleCount as number) >= 15) { foxFemaleGraphBar.innerHTML = `${realFoxFemaleCount}` }
        else { foxFemaleGraphBar.innerHTML = '' }
      })
    ).subscribe()
  SimulationSubscriptions.addSubscription(animalCountSubscription)

  const offspringsSubscription = combineLatest([plantOffsprings$, rabbitOffsprings$, foxOffsprings$]).pipe(
    tap(([plantOffsprings, rabbitOffsprings, foxOffsprings]) => {
      const offspringCountDiv: HTMLElement = document.getElementById('offspringCount')
      offspringCountDiv.innerHTML = `New plants: ${plantOffsprings} | New rabbits: ${rabbitOffsprings} | New foxes: ${foxOffsprings}`
    })
  ).subscribe()
  SimulationSubscriptions.addSubscription(offspringsSubscription)

  const deceasedSubscription = combineLatest([plantDeceased$, rabbitDeceased$, foxDeceased$]).pipe(
    tap(([plantDeceased, rabbitDeceased, foxDeceased]) => {
      const deceasedCountDiv: HTMLElement = document.getElementById('deceasedCount')
      deceasedCountDiv.innerHTML = `Deceased plants: ${plantDeceased} | Deceased rabbits: ${rabbitDeceased} | Deceased foxes: ${foxDeceased}`
    })
  ).subscribe()
  SimulationSubscriptions.addSubscription(deceasedSubscription)

  const randomPlantGeneratorSubscription = handleRandomPlantGenerator(plantsSubject, plantOffspringsSubject, simulationStateSubject).subscribe()
  SimulationSubscriptions.addSubscription(randomPlantGeneratorSubscription)

  const animalMovements$ = getAnimalMovements$(
    frames$,
    plantsSubject,
    plantDeceasedSubject,
    rabbitsSubject,
    rabbitOffspringsSubject,
    rabbitDeceasedSubject,
    foxesSubject,
    foxOffspringsSubject,
    foxDeceasedSubject)
  const animalMovementsSubscription = animalMovements$.subscribe()
  SimulationSubscriptions.addSubscription(animalMovementsSubscription)

  const canvasClicks$ = getCanvasClicks$(rabbitsSubject, foxesSubject)
  const canvasClicksSubscription = canvasClicks$.subscribe()
  SimulationSubscriptions.addSubscription(canvasClicksSubscription)

  const renders$ = animalMovements$.pipe(
    tap(([plants, rabbits, foxes]) => {
      Canvas.fillBackground('lightgreen')
      plants.forEach(plant => plant.draw(Canvas.ctx))
      rabbits.forEach(rabbit => rabbit.draw(Canvas.ctx))
      foxes.forEach(fox => fox.draw(Canvas.ctx))
    })
  )
  const renderSubscription = renders$.subscribe()
  SimulationSubscriptions.addSubscription(renderSubscription)
}
