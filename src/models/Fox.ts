import { tap } from "rxjs"
import Animal from "./Animal"
import Carnivore from "./Carnivore"
import { getInputStream } from "../functions/utils"


class Fox extends Carnivore {

    constructor(public x: number, public y: number, public isBorn: boolean) {
        super(x, y, isBorn)
        this.color = this.sex ? '#ff0000' : '#ff4d4d'
        // this.originalSizeRadius = Parameter.getInstance().foxSize
        getInputStream('foxSizeInput').pipe(
            tap((size) => this.originalSizeRadius = size)
        ).subscribe()
    }

    getOffspring(x: number, y: number): Animal {
        return new Fox(x, y, true)
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        this.sizeRadius = this.originalSizeRadius + this.age / 2
        ctx.arc(this.x, this.y, this.sizeRadius, 0, 2 * Math.PI)
        ctx.fill()
    }

}

export default Fox