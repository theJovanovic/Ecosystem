import { tap } from "rxjs"
import { getInputStream } from "../functions/utils"
import Animal from "./Animal"
import Herbivore from "./Herbivore"


class Rabbit extends Herbivore {

    constructor(public x: number, public y: number, public isBorn: boolean) {
        super(x, y, isBorn)
        this.color = this.sex ? '#0000ff' : '#4d4dff'
        // this.originalSizeRadius = Parameter.getInstance().rabbitSize
        getInputStream('rabbitSizeInput').pipe(
            tap((size) => this.originalSizeRadius = size)
        ).subscribe()
    }

    getOffspring(x: number, y: number): Animal {
        return new Rabbit(x, y, true)
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        this.sizeRadius = this.originalSizeRadius + this.age / 2
        ctx.arc(this.x, this.y, this.sizeRadius, 0, 2 * Math.PI)
        ctx.fill()
    }

}

export default Rabbit