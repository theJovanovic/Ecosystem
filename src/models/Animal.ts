import { getRandomInRange } from "../functions/utils"
import Canvas from "./Canvas"
import Entity from "./Entity"

abstract class Animal extends Entity {
    public age: number
    public maxAge: number
    public energy: number
    public maxEnergy: number
    public dx: number
    public dy: number
    public lastMated: number = 0
    public sex: boolean
    public originalSizeRadius: number

    constructor(public x: number, public y: number, public isBorn: boolean) {
        super(x, y)
        this.maxAge = getRandomInRange(4, 20)
        if (isBorn) {
            this.age = 0
        } 
        else {
            this.age = Math.random() * this.maxAge
        } 
        this.maxEnergy = 100 - this.age * 5
        this.energy = this.maxEnergy
        this.dx = Math.random() * 2 - 1
        this.dy = Math.random() * 2 - 1
        this.sex = Math.random() > 0.5 // female < 0.5 < male
    }

    isStarving(): boolean {
        return this.energy <= 0
    }

    isDead() {
        return this.age >= this.maxAge
    }

    isHungry() {
        return this.energy < (0.9 * this.maxEnergy)
    }

    adjustEnergy(delta: number) {
        this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + delta))
    }
    
    growOlder(age_delta: number, energy_delta: number) {
        this.age += age_delta
        this.maxEnergy -= energy_delta
    }

    canMate(): boolean {
        return (this.energy > 40) && 
        (this.age > 1) && 
        (this.age < 12) &&
        ((this.age - this.lastMated) > 1)
    }

    mate(otherAnimal: this): Animal {
        this.lastMated = this.age
        otherAnimal.lastMated = otherAnimal.age
        const x = (this.x + otherAnimal.x) / 2 
        const y = (this.y + otherAnimal.y) / 2
        return this.getOffspring(x, y)
    }

    abstract getOffspring(x: number, y: number): Animal

    move() {
        const change = Math.random() * 0.5
        this.dx += (Math.random() * 2 - 1) * change
        this.dy += (Math.random() * 2 - 1) * change

        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
        this.dx /= magnitude
        this.dy /= magnitude

        let speed
        if (this.energy >= 35) {
            speed = 1 + Math.random() * 2 // 1-3
        }
        else {
            speed = Math.random() // 0-1 
        }
        const newX = this.x + this.dx * speed
        const newY = this.y + this.dy * speed

        if (newX < 0) {
            this.x = 0
            this.dx = Math.abs(this.dx)
        } else if (newX > Canvas.canvas.width) {
            this.x = Canvas.canvas.width
            this.dx = -Math.abs(this.dx)
        } else {
            this.x = newX
        }

        if (newY < 0) {
            this.y = 0
            this.dy = Math.abs(this.dy)
        } else if (newY > Canvas.canvas.height) {
            this.y = Canvas.canvas.height
            this.dy = -Math.abs(this.dy)
        } else {
            this.y = newY
        }
    }

}

export default Animal
