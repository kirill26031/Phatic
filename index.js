require('dotenv').config()
const fetch = require('node-fetch');
var unirest = require('unirest');
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply("Hi!"))

bot.on('text', (ctx) => {
    console.log(ctx.update.message.text)
    answer(ctx.update.message.text).then(res => ctx.reply(res))
})

bot.launch()

const answer = async (message) =>{
    let m = message.toLowerCase().split(' ')
    m.forEach(word => {wordTypes(word).then(arr=>{
        console.log(word)
        // console.log(arr)
    })})
    return JSON.stringify(m, null, 4)
}

const wordTypes = async (word) => {
    const response = await fetch("https://wordsapiv1.p.rapidapi.com/words/" + word + "/definitions/", {
        headers: {
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": process.env.API_TOKEN,
            "useQueryString": true
        }
    }).then(res => res.json())
    .then(res => {
        if(res.success === false) throw new Error("Unknown word")
        return res.definitions.map(def => def.partOfSpeech).filter((v, i, a) => a.indexOf(v) === i)
    }).then(res => JSON.stringify(res, null, 4))
    .catch(err => {
        console.log(err)
        return null
    })
    console.log(response)
    return response
}