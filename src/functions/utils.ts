import { Observable, fromEvent, map, startWith } from "rxjs"
import Animal from "../models/Animal"
import Canvas from "../models/Canvas"

export function generateRandomEntities<T>(count: number, factory: () => T): T[] {
    const canvasWidth = Canvas.canvas.width
    const canvasHeight = Canvas.canvas.height
    return Array.from({ length: count }, () => factory())
}

export function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
}

export function getSexCount(population: Animal[]) {
    const populationCount = population.length
    let populationMaleCount = population.filter(animal => animal.sex).length
    let populationFemaleCount = populationCount - populationMaleCount
    if (populationCount > 350) {
        populationMaleCount = Math.round((populationMaleCount / populationCount) * 350)
        populationFemaleCount = 350 - populationMaleCount
    }
    return [populationMaleCount, populationFemaleCount]
}

export function getInputStream(id: string): Observable<number> {
    return fromEvent(document.getElementById(id), 'input').pipe(
        map((e: any) => parseInt(e.target.value)),
        startWith(parseFloat((document.getElementById(id) as HTMLInputElement).value))
    )
}

export function getButtonInputStream(id: string): Observable<Event> {
    return fromEvent(document.getElementById(id), 'click')
}