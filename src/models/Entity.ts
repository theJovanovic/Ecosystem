abstract class Entity {

    public color: string
    public sizeRadius: number

    constructor(public x: number, public y: number) {}

    abstract draw(ctx: CanvasRenderingContext2D): void

    static areNear(entity1: Entity, entity2: Entity, threshold: number = 50): boolean {
        const distance = Math.sqrt((entity1.x - entity2.x)**2 + (entity1.y - entity2.y)**2)
        return distance <= threshold
    }
}

export default Entity