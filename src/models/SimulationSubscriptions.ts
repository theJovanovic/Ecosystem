import { Subscription } from "rxjs"

export default class SimulationSubscriptions {
    
    private static subscriptions: Subscription[] = []

    static addSubscription(sub: Subscription) {
        SimulationSubscriptions.subscriptions.push(sub)
    }

    static clearSubscriptions() {

        SimulationSubscriptions.subscriptions.forEach(sub => sub.unsubscribe())
        SimulationSubscriptions.subscriptions = []
    }

}