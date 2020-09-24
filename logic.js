const fetch = require('node-fetch');
const Cache = require('node-cache');
const fs = require('fs')
const patterns = JSON.parse(fs.readFileSync('./patterns.json'))
const cache = new Cache()

const answer = async (message) => {
    let pat = /\W+/
    message = message.toLowerCase()
    let m = message.split(' ')
    let words = await Promise.all(
        m.map(word => { return wordTypes(word.replace(pat, '')) })
    ).then(arr => {
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
                if (match.length === 1) return getRandom(resps)
                else {
                    console.log("here")
                    let result = getRandom(resps)
                    for (let i = 1; i < match.length; ++i) result = result.replace("$" + i, transform_pronoun(match[i]))
                    return result
                }
            }
        }
    }
    return "Error"

}

const wordTypes = async (word) => {
    let cached_value = cache.get(`wordTypes_${word}`)
    if (cached_value !== undefined) return cached_value
    let requested_value = await fetch("https://lingua-robot.p.rapidapi.com/language/v1/entries/en/" + word, {
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
                // entry.lexemes.forEach(lexeme => lexeme.senses.forEach(sense => {
                //     if (sense.definition.match(aux_regex)) arr.push('auxiliary')
                // }))
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
    cache.set(`wordTypes_${word}`, requested_value)
    return requested_value
}

const getRandom = (arr) => arr[Math.floor(arr.length * Math.random())]

const transform_pronoun = (pronoun) => {
    if (patterns.Transform_words.hasOwnProperty(pronoun)) {
        return patterns.Transform_words[pronoun]
    }
    return pronoun
}

module.exports = {
    answer
}