import { getInputStream } from "../functions/utils"

export default class Parameter {
    private static instance: Parameter

    public rabbitAgeAdjustment: number
    public foxAgeAdjustment: number
    public rabbitEnergyAdjustment: number
    public foxEnergyAdjustment: number
    public rabbitMaxEnergyAdjustment: number
    public foxMaxEnergyAdjustment: number
    public rabbitProximityCheck: number
    public foxProximityCheck: number
    public plantMinGeneratorInterval: number
    public plantMaxGeneratorInterval: number

    private constructor() {
        getInputStream('rabbitAgeAdjustmentInput').subscribe(value => this.rabbitAgeAdjustment = value)
        getInputStream('foxAgeAdjustmentInput').subscribe(value => this.foxAgeAdjustment = value)
        getInputStream('rabbitEnergyAdjustmentInput').subscribe(value => this.rabbitEnergyAdjustment = value)
        getInputStream('foxEnergyAdjustmentInput').subscribe(value => this.foxEnergyAdjustment = value)
        getInputStream('rabbitMaxEnergyAdjustmentInput').subscribe(value => this.rabbitMaxEnergyAdjustment = value)
        getInputStream('foxMaxEnergyAdjustmentInput').subscribe(value => this.foxMaxEnergyAdjustment = value)
        getInputStream('rabbitProximityCheckInput').subscribe(value => this.rabbitProximityCheck = value)
        getInputStream('foxProximityCheckInput').subscribe(value => this.foxProximityCheck = value)
        getInputStream('plantMinGeneratorIntervalInput').subscribe(value => this.plantMinGeneratorInterval = value)
        getInputStream('plantMaxGeneratorIntervalInput').subscribe(value => this.plantMaxGeneratorInterval = value)
    }

    public static getInstance(): Parameter {
        if (!Parameter.instance) {
            Parameter.instance = new Parameter()
        }
        return Parameter.instance
    }

}
