import { tap } from "rxjs"
import { getInputStream } from "../functions/utils"
import Entity from "./Entity"

class Plant extends Entity {

    constructor(x: number, y: number) {
        super(x, y)
        this.color = 'darkgreen'
        // this.sizeRadius = Parameter.getInstance().plantSize
        getInputStream('plantSizeInput').pipe(
            tap((size) => this.sizeRadius = size)
        ).subscribe()
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.sizeRadius, 0, 2 * Math.PI)
        ctx.fill()
    }
}

export default Plant