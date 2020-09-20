require('dotenv').config()
const fetch = require('node-fetch');
const fs = require('fs')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

const patterns = JSON.parse(fs.readFileSync('./patterns.json'))

bot.start((ctx) => ctx.reply("Hi!"))

bot.on('text', (ctx) => {
    console.log(ctx.update.message.text)
    // answer(ctx.update.message.text).then(res => ctx.reply(res))
    answer(ctx.update.message.text).then(res => {
        console.log(res)
        ctx.reply(res)
    })
})

bot.launch()

const answer = async (message) => {
    let pat = /\/W+/
    message = message.toLowerCase()
    let m = message.split(' ')
    let words = await Promise.all(
        m.map(word => { return wordTypes(word.replace(pat, '')) })
    ).then(values => {
        o_v = []
        values.forEach(w => o_v.splice(m.indexOf(w.text), 0, w))
        return o_v
    })
        .then(arr => {
            let str = ""
            arr.forEach(w => {
                str = str + w.text + '-('
                w.parts.forEach(p => str = str + '/' + p)
                str = str + ') '
            })
            return str
        })
    console.log(words)
    // return words
    // can-(/verb/noun) you-(/verb/pronoun) explain-(/verb) me-(/pronoun) this-(/noun/adverb/pronoun/interjection)
    for (key in patterns.Patterns) {
        if (patterns.Patterns.hasOwnProperty(key)) {
            let match = words.match(key)
            if (match) {
                let resps = patterns.Patterns[key]
                if (match.length===1) return getRandom(resps)
                else{
                    console.log("here")
                    let result = getRandom(resps)
                    for(let i=1; i<match.length; ++i) result = result.replace("$"+i, transform_pronoun(match[i]))
                    return result
                }
            }
        }
    }
    return "Error"

}

const wordTypes = async (word) => {
    return await fetch("https://lingua-robot.p.rapidapi.com/language/v1/entries/en/" + word, {
        headers: {
            "x-rapidapi-host": "lingua-robot.p.rapidapi.com",
            "x-rapidapi-key": process.env.API_TOKEN,
            "useQueryString": true
        }
    }).then(res => res.json())
        .then(res => {
            if (res.success === false) throw new Error("Unknown word")
            let arr = []
            const aux_regex = /\(auxiliary\)/
            res.entries.forEach(entry => {
                entry.interpretations.forEach(inter => arr.push(inter.partOfSpeech))
                entry.lexemes.forEach(lexeme => lexeme.senses.forEach(sense => {
                    if (sense.definition.match(aux_regex)) arr.push('auxiliary')
                }))
            })
            return {
                text: word,
                // entries: res.entries.map(entry => entry.entry),
                parts: arr.filter((v, i, a) => a.indexOf(v) === i)
            }
        })
        .catch(err => {
            console.log(err)
            return null
        })
}

const getRandom = (arr) => arr[Math.floor(arr.length * Math.random())]

const transform_pronoun = (pronoun) => {
    if (patterns.Transform_words.hasOwnProperty(pronoun)) {
        return patterns.Transform_words[pronoun]
    }
    return pronoun
}