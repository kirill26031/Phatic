const fetch = require('node-fetch');
const Cache = require('node-cache');
const fs = require('fs')
const api = require('./api')
const patterns = JSON.parse(fs.readFileSync('./patterns.json'))
const cache = new Cache()

const answer = async (message) => {
    let resultArray = []
    let m = message.split(/\W+/).filter(str => str.length > 0)
    let words = await Promise.all(
        m.map(word => { return wordTypes(word) })
    )
    words = await Promise.all(
        words.map(async word => {
            let name = await api.getGender(word.text, cache)
            if (name.gender !== undefined) {
                word.parts = ['name', name.gender]
            }
            else {
                word.text = word.text.toLowerCase()
            }
            return word
        })
    )
    let str = ""
    words.forEach(w => {
        str = str + w.text + '-('
        w.parts.forEach(p => str = str + '/' + p)
        str = str + ') '
    })

    console.log(str)
    // return words
    // can-(/verb/noun) you-(/verb/pronoun) explain-(/verb) me-(/pronoun) this-(/noun/adverb/pronoun/interjection)
    // const format_regex = /<f>((?:[^<])*)<\/f>/g
    let matchedFlag = ''
    for(key in patterns.Flags){
        if(str.includes(key)){
            matchedFlag = patterns.Flags[key]
        }
    }

    resultArray.concat(getFlagResponse(matchedFlag))
    console.log(resultArray.length)
    if (resultArray.length != 0){
     return resultArray
    }

    const format_regex = /(?:\w+)-\((?:\/\w+)*\)/g
    for (key in patterns.Patterns) {
        if (patterns.Patterns.hasOwnProperty(key)) {
            let pattern = (key.match(/\$/)) ? decode_key(key) : key
            let match = str.match(pattern)
            if (match) {
                let resps = patterns.Patterns[key]
                if (match.length === 1) {
                    resultArray.push(getRandom(resps))
                    return resultArray
                }
                else {
                    let result = getRandom(resps)
                    for (let i = 1; i < match.length; ++i) result = result.replace("$" + i, transform_pronoun(match[i]))
                    let format_match = result.match(format_regex)
                    if(!format_match){
                        resultArray.push(result)
                        return resultArray
                    }
                    format_match.forEach(word => {
                        result = result.replace(word, transform_pronoun(word.replace(/-\((?:\/\w+)*\)/, "")))
                    })

                    resultArray.push(result)
                    return resultArray
                }
            }
        }
    }

    resultArray.push("Error")
    return resultArray

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
    for (v in patterns.Variables) {
        if (patterns.Variables.hasOwnProperty(v)) {
            let regex = new RegExp(`\\${v}`, 'g')
            pattern = pattern.replace(regex, patterns.Variables[v])
        }
    }
    return pattern
}

const toUpper = (str) => str.charAt(0).toUpperCase()+str.slice(1)

async function getFlagResponse(flag) {
    switch(flag.id){
        case "RANDOM_FACT_FLAG":
            const resultArray = []
            n = Math.floor(Math.random() * flag["generic"].length) 
            resultArray.push(flag["generic"][n])
            resultArray.push(await api.getRandomFact().then(res => {return res.text}))
            return resultArray
        default:
            return []
    }
}

module.exports = {
    answer,
    toUpper
}