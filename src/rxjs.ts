import { take, map, interval, filter, combineLatest, Subject, Observable, from, takeUntil } from "rxjs";
import { fromEvent } from "rxjs/internal/observable/fromEvent";
import { sampleTime } from "rxjs/internal/operators/sampleTime";

// const tok1 = interval(100).pipe(
//     take(10),
//     filter(x => x%2 === 0),
//     map(x => x*2),
// )
// .subscribe(x => console.log(x))
// const tok2 = interval(200).pipe(
//     take(10),
//     map(x => `Broj: ${x}`)
// )
// .subscribe(x => console.log(x))
///SPAJANJE TOKOVA///
// combineLatest([tok1, tok2]).subscribe(([x,y]) => console.log(`${x} | ${y}`))

///STOPING STREAM///
// function getRandomNumber() {
//     return new Observable(generator => {
//         setInterval(() => {
//             const number = Math.floor(Math.random() * 20 + 1)
//             generator.next(number)
//         }, 100)
//     })
// }
// const subForRandom = getRandomNumber()
//     .pipe(
//         take(100)
//     )
//     .subscribe(x => console.log(x))
// function createStopButton() {
//     const button = document.createElement("button")
//     button.innerHTML = "Stop!"
//     document.body.appendChild(button)
//     button.onclick = () => {
//         subForRandom.unsubscribe()
//         console.log("Unsubscribed!");
//     }
// }
// createStopButton()

///STREAM CONTROL///
// const controlStream = new Subject()
// const streamOfNumbers = interval(100)
//     .pipe(
//         takeUntil(controlStream)
//     )
//     .subscribe(x => console.log(x))
// function createStopButton() { 
//     const button = document.createElement("button")
//     button.innerHTML = "Stop!"
//     document.body.appendChild(button)
//     button.onclick = () => {
//         controlStream.next(null)
//         console.log("Unsubscribed!" + streamOfNumbers.closed);
//     }
// }
// createStopButton()

///EVENTS///
// interface Coordinates {
//     x: number;
//     y: number;
// }
// fromEvent(document, "mousemove")
// .pipe(
//     sampleTime(500),
//     map((event: MouseEvent) => ({x: event.x, y: event.y}))
// )
// .subscribe((coordinates: Coordinates) => console.log(coordinates))
