require('dotenv').config()
// const fetch = require('node-fetch');
// const Cache = require('node-cache');
// const fs = require('fs')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const logic = require('./logic')


// const cache = new Cache()


bot.on('text',  (ctx) => {
    console.log(ctx.update.message.text)
    logic.answer(ctx.update.message.text).then(async res => {
        res = res.map(elem => logic.toUpper(elem))
        console.log(res)

        for(let msg of res){
            await ctx.reply(msg);
        }
        
    })
})


bot.launch()