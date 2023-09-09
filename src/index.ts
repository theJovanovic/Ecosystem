import Canvas from './models/Canvas'
import Parameter from './models/Parameter'
import { BehaviorSubject } from 'rxjs'
import { getGraphClicks$, getMergedPanelClicks$, getPauseButtonClicks$, getSettingsClicks$, getSimulationSpeeds$, getStartButtonClicks$ } from './utils/observables'

Canvas.initializeCanvas('ecosystemCanvas')
Canvas.fillBackground('lightgreen')
Parameter.getInstance()

const settingsClicks$ = getSettingsClicks$()
const graphClicks$ = getGraphClicks$()
getMergedPanelClicks$(settingsClicks$, graphClicks$).subscribe()

const simulationSpeedSubject = new BehaviorSubject<number>(parseInt((document.getElementById('simulationSpeedInput') as HTMLInputElement).value))
getSimulationSpeeds$(simulationSpeedSubject).subscribe()

const simulationStateSubject = new BehaviorSubject<boolean>(true)

getStartButtonClicks$(simulationSpeedSubject, simulationStateSubject).subscribe()
getPauseButtonClicks$(simulationStateSubject).subscribe()