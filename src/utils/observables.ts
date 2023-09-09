import { BehaviorSubject, EMPTY, Observable, Subject, combineLatest, filter, fromEvent, map, merge, startWith, switchMap, tap, timer, withLatestFrom } from "rxjs"
import Canvas from "../models/Canvas"
import SimulationSubscriptions from "../models/SimulationSubscriptions"
import startSimulation from "../simulation/simulation"
import Plant from "../models/Plant"
import Parameter from "../models/Parameter"
import Rabbit from "../models/Rabbit"
import Fox from "../models/Fox"
import { processRabbits } from "./ProcessRabbits"
import { processFoxes } from "./ProcessFoxes"
import { getRelativeMousePos, isPointInEntity } from "./functions"

const settingsButton = document.getElementById('settingsBtn')
const graphButton = document.getElementById('graphBtn')
const settingsPanel = document.getElementById('settingsPanel')
const graphPanel = document.getElementById('graphPanel')

export function getInputStream(id: string): Observable<number> {
  return fromEvent(document.getElementById(id), 'input').pipe(
    map((e: any) => parseInt(e.target.value)),
    startWith(parseFloat((document.getElementById(id) as HTMLInputElement).value))
  )
}

export function getButtonInputStream(id: string): Observable<Event> {
  return fromEvent(document.getElementById(id), 'click')
}

export function getSettingsClicks$() {
  return fromEvent(settingsButton, 'click').pipe(
    tap(() => {
      if (settingsPanel.style.display === 'flex') {
        settingsButton.style.backgroundColor = 'rgb(70, 70, 70)'
      }
      else {
        settingsButton.style.backgroundColor = 'rgb(100, 100, 100)'
        graphButton.style.backgroundColor = 'rgb(70, 70, 70)'
      }
    }),
    map(() => {
      if (settingsPanel.style.display === 'flex') {
        return 'close'
      }
      return 'settings'
    })
  )
}

export function getGraphClicks$() {
  return fromEvent(graphButton, 'click').pipe(
    tap(() => {
      if (graphPanel.style.display === 'block') {
        graphButton.style.backgroundColor = 'rgb(70, 70, 70)'
      }
      else {
        graphButton.style.backgroundColor = 'rgb(100, 100, 100)'
        settingsButton.style.backgroundColor = 'rgb(70, 70, 70)'
      }
    }),
    map(() => {
      if (graphPanel.style.display === 'block') {
        return 'close'
      }
      return 'graph'
    })
  )
}

export function getMergedPanelClicks$(settingsClicks$: Observable<string>, graphClicks$: Observable<string>) {
  return merge(settingsClicks$, graphClicks$).pipe(
    tap((displayedDiv) => {
      if (displayedDiv === 'settings') {
        settingsPanel.style.display = 'flex'
        graphPanel.style.display = 'none'
      } else if (displayedDiv === 'graph') {
        settingsPanel.style.display = 'none'
        graphPanel.style.display = 'block'
      } else if (displayedDiv === 'close') {
        settingsPanel.style.display = 'none'
        graphPanel.style.display = 'none'
      }
    })
  )
}

export function getSimulationSpeeds$(simulationSpeedSubject: BehaviorSubject<number>) {
  return getInputStream('simulationSpeedInput').pipe(
    tap((value: number) => (document.getElementById('simulationSpeedSpan') as HTMLInputElement).innerText = `Simulation speed (${value}fps):`),
    map((fps: number) => Math.ceil(1000 / fps)),
    tap((value: number) => {
      simulationSpeedSubject.next(value)
    })
  )
}

export function getStartButtonClicks$(simulationSpeedSubject: BehaviorSubject<number>, simulationStateSubject: BehaviorSubject<boolean>) {

  return getButtonInputStream('startBtn').pipe(
    withLatestFrom(getInputStream('plantCountInput'), getInputStream('rabbitCountInput'), getInputStream('foxCountInput')),
    tap(([_, plantsCount, rabbitsCount, foxesCount]) => {
      simulationStateSubject.next(true)
      Canvas.fillBackground('lightgreen')
      SimulationSubscriptions.clearSubscriptions()
      startSimulation(plantsCount, rabbitsCount, foxesCount, simulationSpeedSubject, simulationStateSubject)
    })
  )
}

export function getPauseButtonClicks$(simulationStateSubject: BehaviorSubject<boolean>) {
  return getButtonInputStream('pauseBtn').pipe(
    tap(() => {
      const currentState = simulationStateSubject.getValue()
      simulationStateSubject.next(!currentState)
    })
  )
}

export function handleRandomPlantGenerator(
  plantsSubject: BehaviorSubject<Plant[]>,
  plantOffspringsSubject: Subject<number>,
  simulationStates$: Observable<boolean>)
  : Observable<void> {

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
          switchMap(() => handleRandomPlantGenerator(plantsSubject, plantOffspringsSubject, simulationStates$))
        )
      } else {
        return EMPTY
      }
    })
  )
}

export function getAnimalMovements$(
  frames$: Observable<number>,
  plantsSubject: BehaviorSubject<Plant[]>,
  plantDeceasedSubject: Subject<number>,
  rabbitsSubject: BehaviorSubject<Rabbit[]>,
  rabbitOffspringsSubject: Subject<number>,
  rabbitDeceasedSubject: Subject<number>,
  foxesSubject: BehaviorSubject<Fox[]>,
  foxOffspringsSubject: Subject<number>,
  foxDeceasedSubject: Subject<number>)
  : Observable<[Plant[], Rabbit[], Fox[]]> {

  return frames$.pipe(
    withLatestFrom(combineLatest([plantsSubject, rabbitsSubject, foxesSubject])),
    map(([_, [plants, rabbits, foxes]]) => {
      const newRabbits = processRabbits(rabbits, rabbitOffspringsSubject, rabbitDeceasedSubject, plants, plantDeceasedSubject)
      const newFoxes = processFoxes(foxes, foxOffspringsSubject, foxDeceasedSubject, newRabbits, rabbitDeceasedSubject)

      rabbitsSubject.next(newRabbits)
      foxesSubject.next(newFoxes)

      return [plants, newRabbits, newFoxes]
    })
  )
}

export function getCanvasClicks$(rabbitsSubject: BehaviorSubject<Rabbit[]>, foxesSubject: BehaviorSubject<Fox[]>) {
  return fromEvent(Canvas.canvas, 'click').pipe(
    map((event: MouseEvent) => getRelativeMousePos(event)),
    withLatestFrom(combineLatest([rabbitsSubject, foxesSubject])),
    map(([click, [rabbits, foxes]]) => {
      const clickedRabbit = rabbits.find(rabbit => isPointInEntity(click.x, click.y, rabbit))
      const clickedFox = foxes.find(fox => isPointInEntity(click.x, click.y, fox))
      return clickedRabbit || clickedFox
    }),
    filter(entity => !!entity),
    tap(animal => {
      const animalSpecies = animal instanceof Fox ? "FOX" : "RABBIT"
      alert(`
        ${animalSpecies}\n
        Sex: ${animal.sex ? "male" : "female"}\n
        Age: ${(animal.age).toFixed(2)} year(s)\n
        Energy: ${animal.energy.toFixed(2)} / ${animal.maxEnergy.toFixed(2)}\n
      `)
    })
  )
}