const fetch = require('node-fetch');
const Cache = require('node-cache');
const fs = require('fs')
const patterns = JSON.parse(fs.readFileSync('./patterns.json'))
const cache = new Cache()

const answer = async (message) => {
    message = message.toLowerCase()
    let m = message.split(/\W+/).filter(str => str.length > 0)
    let words = await Promise.all(
        m.map(word => { return wordTypes(word) })
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
    // const format_regex = /<f>((?:[^<])*)<\/f>/g
    const format_regex = /(?:\w+)-\((?:\/\w+)*\)/g
    for (key in patterns.Patterns) {
        if (patterns.Patterns.hasOwnProperty(key)) {
            let pattern = (key.match(/\$/)) ? decode_key(key) : key
            let match = words.match(pattern)
            if (match) {
                let resps = patterns.Patterns[key]
                if (match.length === 1) return getRandom(resps)
                else {
                    let result = getRandom(resps)
                    for (let i = 1; i < match.length; ++i) result = result.replace("$" + i, transform_pronoun(match[i]))
                    let format_match = result.match(format_regex)
                    if(!format_match) return result
                    format_match.forEach(word => {
                        result = result.replace(word, transform_pronoun(word.replace(/-\((?:\/\w+)*\)/, "")))
                    })
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
            // const aux_regex = /\(auxiliary\)/
            // used in the next pattern
            //"^\\w+-\\((?:\/\\w+)*\/auxiliary": ["Yes", "No", "Maybe", "Who knows?", "We will never know"],
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

const decode_key = (key) => {
    let pattern = key
    for(v in patterns.Variables){
        if(patterns.Variables.hasOwnProperty(v)){
            let regex = new RegExp(`\\${v}`, 'g')
            pattern = pattern.replace(regex, patterns.Variables[v])
        } 
    }
    return pattern
}

module.exports = {
    answer
}