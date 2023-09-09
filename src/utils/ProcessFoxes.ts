import { Subject } from "rxjs"
import Fox from "../models/Fox"
import Rabbit from "../models/Rabbit"
import Parameter from "../models/Parameter"
import Entity from "../models/Entity"

export function processFoxes(
    foxes: Fox[],
    foxOffspringsSubject: Subject<number>,
    foxDeceasedSubject: Subject<number>,
    rabbits: Rabbit[],
    rabbitDeceasedSubject: Subject<number>)
    : Fox[] {
        
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