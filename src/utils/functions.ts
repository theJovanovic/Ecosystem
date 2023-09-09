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

export function isPointInEntity(clickX: number, clickY: number, animal: Animal) {
    const dx = clickX - animal.x
    const dy = clickY - animal.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const result = distance <= animal.sizeRadius
    return result
}

export function getRelativeMousePos(evt: MouseEvent) {
    const rect = Canvas.canvas.getBoundingClientRect()
    const scaleX = rect.width / Canvas.canvas.width
    const scaleY = rect.height / Canvas.canvas.height
    const x = (evt.clientX - rect.left) / scaleX
    const y = (evt.clientY - rect.top) / scaleY
    return { x, y }
}