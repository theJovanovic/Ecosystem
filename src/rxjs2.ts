// import { Observable, debounceTime, from, fromEvent, map, retry, switchMap } from "rxjs"

// interface Movie {
//     id: string,
//     title: string,
//     year: number,
//     score: number
// }

// function getMovie(movieId: String): Observable<Movie> {
//     return from(
//         fetch("http://localhost:3000/movies/" + movieId)
//             .then(response => {
//                 if (response.ok) {
//                     return response.json()
//                 }
//                 else {
//                     throw Error("Failed to fetch movie!")
//                 }
//             })
//             .catch(
//                 err => console.log(err)
//             )
//     )
// }

// const movieTextBox = document.createElement('input')
// movieTextBox.type = 'text'
// document.body.appendChild(movieTextBox)

// fromEvent(movieTextBox, 'input')
//     .pipe(
//         debounceTime(1000),
//         map((inputEvent: InputEvent) => (<HTMLInputElement>inputEvent.target).value),
//         switchMap((movieId: string) => getMovie(movieId))
//     )
//     .subscribe(
//         movie => console.log(movie)
//     )