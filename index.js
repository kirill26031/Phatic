require('dotenv').config()
// const fetch = require('node-fetch');
// const Cache = require('node-cache');
// const fs = require('fs')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const logic = require('./logic')


// const cache = new Cache()

bot.start((ctx) => ctx.reply("Hi!"))

bot.on('text',  (ctx) => {
    console.log(ctx.update.message.text)
    // answer(ctx.update.message.text).then(res => ctx.reply(res))
    logic.answer(ctx.update.message.text).then(async res => {
        console.log(res)

        for(let msg of res){
            await ctx.reply(msg);
        }
        
        // Promise.all(promises).then(() => 
        //     console.log('done')
        // );
    })
})

bot.launch()