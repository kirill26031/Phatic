require('dotenv').config()
// const fetch = require('node-fetch');
// const Cache = require('node-cache');
// const fs = require('fs')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const logic = require('./logic')


// const cache = new Cache()

bot.start((ctx) => ctx.reply("Hi!"))

bot.on('text', (ctx) => {
    console.log(ctx.update.message.text)
    // answer(ctx.update.message.text).then(res => ctx.reply(res))
    logic.answer(ctx.update.message.text).then(res => {
        res = logic.toUpper(res)
        console.log(res)
        ctx.reply(res)
    })
})

bot.launch()