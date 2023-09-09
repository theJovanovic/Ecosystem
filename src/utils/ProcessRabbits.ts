import { Subject } from "rxjs"
import Rabbit from "../models/Rabbit"
import Plant from "../models/Plant"
import Parameter from "../models/Parameter"
import Entity from "../models/Entity"

export function processRabbits(
    rabbits: Rabbit[],
    rabbitOffspringsSubject: Subject<number>,
    rabbitDeceasedSubject: Subject<number>,
    plants: Plant[],
    plantDeceasedSubject: Subject<number>)
    : Rabbit[] {
        
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