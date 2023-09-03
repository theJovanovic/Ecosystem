import { from, map, pairwise, scan } from "rxjs";

const array = [1,3,5,8,6,2,4,7]

console.log(array);


from(array)
.pipe(
    pairwise(),
    map(([prev,curr]) => `${prev} ${curr}`)
)
.subscribe(x => console.log("Pairwise: " + x))

from(array)
.pipe(
    scan((acc, x) => acc + x)
)
.subscribe(x => console.log("Scan: " + x))