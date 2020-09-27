const fetch = require('node-fetch');

async function getRandomFact() {
    return fetch('https://uselessfacts.jsph.pl/random.json?language=en')
    .then(res => res.json());
} 


module.exports = {
    getRandomFact
}


// if(message.includes("fact")){
//     resultArray.push(genericPhrase[Math.floor(Math.random()*resultArray.length)])
//     resultArray.push(await facts.getRandomFact().then(res => {return res.text}))
    
//     return resultArray
// }