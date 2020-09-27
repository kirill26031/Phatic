const fetch = require('node-fetch');

const getGender = async (name, cache) => {
    let cached_value = cache.get(`getGender_${name}`)
    if (cached_value !== undefined) return cached_value
    return await fetch("https://blar-names-v1.p.rapidapi.com/gender?name=" + name, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "blar-names-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.API_TOKEN,
            "useQueryString": true
        }
    }).then(r => r.json())
    .then(res=>{
        if(res.gender==='unisex') res.gender=undefined;
        cache.set(`getGender_${name}`, res)
        return res
    })
}

async function getRandomFact() {
    return fetch('https://uselessfacts.jsph.pl/random.json?language=en')
    .then(res => res.json());
} 

module.exports = {
    getGender,getRandomFact
}

// if(message.includes("fact")){
//     resultArray.push(genericPhrase[Math.floor(Math.random()*resultArray.length)])
//     resultArray.push(await facts.getRandomFact().then(res => {return res.text}))
    
//     return resultArray
// }