import { map, tap, withLatestFrom } from 'rxjs/operators'
import startSimulation from './simulation/simulation'
import SimulationSubscriptions from './models/SimulationSubscriptions'
import Canvas from './models/Canvas'
import Parameter from './models/Parameter'
import { getButtonInputStream, getInputStream } from './functions/utils'
import { BehaviorSubject, fromEvent, merge } from 'rxjs'

Canvas.initializeCanvas('ecosystemCanvas')
Canvas.fillBackground('lightgreen')
Parameter.getInstance()

const settingsButton = document.getElementById('settingsBtn')
const graphButton = document.getElementById('graphBtn')
const settingsPanel = document.getElementById('settingsPanel')
const graphPanel = document.getElementById('graphPanel')
const settingsClicks$ = fromEvent(settingsButton, 'click').pipe(
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
const graphClicks$ = fromEvent(graphButton, 'click').pipe(
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
merge(settingsClicks$, graphClicks$).pipe(
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
).subscribe()

const simulationSpeedSubject = new BehaviorSubject<number>(parseInt((document.getElementById('simulationSpeedInput') as HTMLInputElement).value))
getInputStream('simulationSpeedInput').pipe(
  tap((value: number) => (document.getElementById('simulationSpeedSpan') as HTMLInputElement).innerText = `Simulation speed (${value}fps):`),
  map((fps: number) => Math.ceil(1000 / fps)),
  tap((value: number) => {
    console.log(value)
    simulationSpeedSubject.next(value)
  })
).subscribe()

const simulationStateSubject = new BehaviorSubject<boolean>(true)

getButtonInputStream('startBtn').pipe(
  withLatestFrom(getInputStream('plantCountInput'), getInputStream('rabbitCountInput'), getInputStream('foxCountInput')),
  tap(([_, plantsCount, rabbitsCount, foxesCount]) => {
    simulationStateSubject.next(true)
    Canvas.fillBackground('lightgreen')
    SimulationSubscriptions.clearSubscriptions()
    startSimulation(plantsCount, rabbitsCount, foxesCount, simulationSpeedSubject, simulationStateSubject)
  })
).subscribe()

getButtonInputStream('pauseBtn').pipe(
  tap(() => {
    const currentState = simulationStateSubject.getValue()
    simulationStateSubject.next(!currentState)
  })
).subscribe()


