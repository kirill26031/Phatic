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
module.exports = {
    getGender
}