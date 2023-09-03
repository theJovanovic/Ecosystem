export default class Canvas {
    public static canvas: any
    public static ctx: CanvasRenderingContext2D

    static initializeCanvas(className: string) {
        Canvas.canvas = document.getElementById(className)
        Canvas.ctx = Canvas.canvas.getContext('2d')
    }

    static fillBackground(color: string) {
        Canvas.ctx.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height)
        Canvas.ctx.fillStyle = color
        Canvas.ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height)
    }

}