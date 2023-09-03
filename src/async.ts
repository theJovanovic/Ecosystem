// let response = fetch("https://go-apod.herokuapp.com/apod")
//     .then(response => response.json())
//     .then(post => {
//         const img = document.createElement("img")
//         img.src = post.url
//         document.body.appendChild(img)
//     })

// function supplyTwoInts(cb: (a:number, b:number)=>number):number {
//     return cb(10,5)
// }

// setTimeout(() => {
//     const res = supplyTwoInts((a:number,b:number)=>a+b)
//     console.log(`Resenje je: ${res}`)
// }, 1000);

// console.log("CALLBACKS//////////////////////////////////////////////////////////////////////////////////////////////")

// function generateRandomNumber(cb:(a:number)=>void){
//     let res = null
//     setTimeout(() => {
//         cb(Math.floor(Math.random()*10))
//     }, Math.floor(Math.random()*5000));
// }

// generateRandomNumber(x=>console.log(x))
// generateRandomNumber(x=>console.log(x))
// generateRandomNumber(x=>console.log(x))

///callback hell///
// generateRandomNumber(x=>{
//     console.log(x)
//     generateRandomNumber(x=>{
//         console.log(x)
//         generateRandomNumber(x=>{
//             console.log(x)
//         })
//     })
// })
///callback hell///

// console.log("PROMISES//////////////////////////////////////////////////////////////////////////////////////////////")

// async function generateRandomNumber(){
//     return new Promise((resolve, reject)=>{
//         setTimeout(() => {
//             const res = Math.floor(Math.random()*10)
//             res === 0 ? reject('Ne volimo 0.') : resolve(res)
//         }, Math.floor(Math.random()*5000));
//     })
// }

///I nacin///
// const niz = []
// niz.push(await generateRandomNumber())
// console.log(niz[0])
// niz.push(await generateRandomNumber())
// console.log(niz[1])
// niz.push(await generateRandomNumber())
// console.log(niz[2])
///I nacin///

///II nacin///
// generateRandomNumber()
//     .then(x=>{console.log(x); return generateRandomNumber()})
//     .then(x=>{console.log(x); return generateRandomNumber()})
//     .then(x=>{console.log(x); return generateRandomNumber()})
//     .catch(err=>console.error(err))
///II nacin///

///III nacin///
// Promise.allSettled([
//     generateRandomNumber(),
//     generateRandomNumber(),
//     generateRandomNumber()
// ]).then(a=>{
//     a.forEach(x=>console.log(x))
// })
///III nacin///

// export {}