import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  combineLatest,
  fromEvent,
  interval,
  timer,
  withLatestFrom
} from "rxjs"
import { switchMap, tap, map, scan, startWith, filter } from "rxjs/operators"
import Fox from "../models/Fox"
import Plant from "../models/Plant"
import Rabbit from "../models/Rabbit"
import SimulationSubscriptions from "../models/SimulationSubscriptions"
import Canvas from "../models/Canvas"
import Entity from "../models/Entity"
import Parameter from "../models/Parameter"
import { generateRandomEntities, getRelativeMousePos, getSexCount, isPointInEntity } from "../functions/utils"

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

function handleRandomPlantGenerator(plantsSubject: BehaviorSubject<Plant[]>, simulationStates$: Observable<boolean>): Observable<void> {
  const canvasWidth = Canvas.canvas.width
  const canvasHeight = Canvas.canvas.height

  return combineLatest([
    simulationStates$,
    timer(0)
  ]).pipe(
    switchMap(([isRunning]) => {
      if (isRunning) {
        const randomTime = Math.random() * (Parameter.getInstance().plantMaxGeneratorInterval - Parameter.getInstance().plantMinGeneratorInterval) + Parameter.getInstance().plantMinGeneratorInterval
        return timer(randomTime).pipe(
          tap(() => {
            const newPlant = new Plant(Math.random() * canvasWidth, Math.random() * canvasHeight)
            const currentPlants = plantsSubject.getValue()
            currentPlants.push(newPlant)
            plantsSubject.next(currentPlants)
            plantOffspringsSubject.next(1)
          }),
          switchMap(() => handleRandomPlantGenerator(plantsSubject, simulationStates$))
        )
      } else {
        return EMPTY
      }
    })
  )
}

function handleAnimalMovements(
  frame$: Observable<number>,
  plantsSubject: BehaviorSubject<Plant[]>,
  rabbitsSubject: BehaviorSubject<Rabbit[]>,
  foxesSubject: BehaviorSubject<Fox[]>): Observable<[Plant[], Rabbit[], Fox[]]> {
  return frame$.pipe(
    withLatestFrom(combineLatest([plantsSubject, rabbitsSubject, foxesSubject])),
    map(([_, [plants, rabbits, foxes]]) => {
      const newRabbits = processRabbits(rabbits, plants)
      const newFoxes = processFoxes(foxes, newRabbits)

      rabbitsSubject.next(newRabbits)
      foxesSubject.next(newFoxes)

      return [plants, newRabbits, newFoxes]
    })
  )
}

function processRabbits(rabbits: Rabbit[], plants: Plant[]): Rabbit[] {
  const rabbitOffsprings: Rabbit[] = []
  rabbits.forEach(rabbit => {
    rabbit.move()
    rabbit.adjustEnergy(Parameter.getInstance().rabbitEnergyAdjustment)

    if (rabbit.isHungry()) {
      const indexToEat = plants.findIndex(plant => Entity.areNear(rabbit, plant, Parameter.getInstance().rabbitProximityCheck))
      if (indexToEat !== -1) {
        // console.log('plant is eaten')
        plants.splice(indexToEat, 1)
        rabbit.adjustEnergy(20)
        plantDeceasedSubject.next(1)
      }
    }

    const indexToMate = rabbits.findIndex(otherRabbit =>
      (rabbit.sex !== otherRabbit.sex) &&
      (rabbit !== otherRabbit) &&
      Entity.areNear(rabbit, otherRabbit, Parameter.getInstance().rabbitProximityCheck + otherRabbit.sizeRadius) &&
      rabbit.canMate() &&
      otherRabbit.canMate())
    if (indexToMate !== -1) {
      // console.log('rabbit is born')
      const matingRabbit = rabbits[indexToMate]
      const rabbitOffspring = rabbit.mate(matingRabbit)
      rabbitOffsprings.push(rabbitOffspring)
      rabbitOffspringsSubject.next(1)
    }

    rabbit.growOlder(Parameter.getInstance().rabbitAgeAdjustment, Parameter.getInstance().rabbitMaxEnergyAdjustment)
  })

  const newRabbits = [...rabbits, ...rabbitOffsprings]
  const filteredRabbits = newRabbits.filter(rabbit => !rabbit.isDead() && !rabbit.isStarving())
  rabbitDeceasedSubject.next(newRabbits.length - filteredRabbits.length)

  return filteredRabbits
}

function processFoxes(foxes: Fox[], rabbits: Rabbit[]): Fox[] {
  const foxOffsprings: Fox[] = []
  foxes.forEach(fox => {
    fox.move()
    fox.adjustEnergy(Parameter.getInstance().foxEnergyAdjustment)

    if (fox.isHungry()) {
      const indexToEat = rabbits.findIndex(rabbit => Entity.areNear(fox, rabbit, Parameter.getInstance().foxProximityCheck + rabbit.sizeRadius))
      if (indexToEat !== -1) {
        // console.log('rabbit is eaten')
        rabbits.splice(indexToEat, 1)
        fox.adjustEnergy(50)
        rabbitDeceasedSubject.next(1)
      }
    }

    const indexToMate = foxes.findIndex(otherFox =>
      (fox.sex !== otherFox.sex) &&
      (fox !== otherFox) &&
      Entity.areNear(fox, otherFox, Parameter.getInstance().foxProximityCheck + otherFox.sizeRadius) &&
      fox.canMate() &&
      otherFox.canMate())
    if (indexToMate !== -1) {
      // console.log('fox is born')
      const matingFox = foxes[indexToMate]
      const foxOffspring = fox.mate(matingFox)
      foxOffsprings.push(foxOffspring)
      foxOffspringsSubject.next(1)
    }

    fox.growOlder(Parameter.getInstance().foxAgeAdjustment, Parameter.getInstance().foxMaxEnergyAdjustment)
  })

  const newFoxes = [...foxes, ...foxOffsprings]
  const filteredFoxes = newFoxes.filter(fox => !fox.isDead() && !fox.isStarving())
  foxDeceasedSubject.next(newFoxes.length - filteredFoxes.length)

  return filteredFoxes
}

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

  const randomPlantGeneratorSubscription = handleRandomPlantGenerator(plantsSubject, simulationStateSubject).subscribe()
  SimulationSubscriptions.addSubscription(randomPlantGeneratorSubscription)

  const animalMovements$ = handleAnimalMovements(frames$, plantsSubject, rabbitsSubject, foxesSubject)
  const animalMovementsSubscription = animalMovements$.subscribe()
  SimulationSubscriptions.addSubscription(animalMovementsSubscription)

  const canvasClicks$ = fromEvent(Canvas.canvas, 'click').pipe(
    map((event: MouseEvent) => getRelativeMousePos(event)),
    withLatestFrom(combineLatest([rabbitsSubject, foxesSubject])),
    map(([click, [rabbits, foxes]]) => {
      const clickedRabbit = rabbits.find(rabbit => isPointInEntity(click.x, click.y, rabbit))
      const clickedFox = foxes.find(fox => isPointInEntity(click.x, click.y, fox))
      return clickedRabbit || clickedFox
    }),
    filter(entity => !!entity)
  )
  const showAgeSubscription = canvasClicks$.subscribe(animal => {
    const animalSpecies = animal instanceof Fox ? "FOX" : "RABBIT"
    alert(`
      ${animalSpecies}\n
      Sex: ${animal.sex ? "male" : "female"}\n
      Age: ${animal.age}\n
      Energy: ${animal.energy}\n
      Max energy: ${animal.maxEnergy}
    `)
  })
  SimulationSubscriptions.addSubscription(showAgeSubscription)

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
