const scrapper = require('./index.js')
const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TELEGRAM_BOT_TOKEN

const commands = [

    {
        command: "start",
        description: "Run Bot"
    },
    {
        command: "menu",
        description: "Select what you want"
    },
    {
        command: "help",
        description: "Get helpful information"
    },

]

// const defaultCommand = {
//     start: '/start',
//     help: '/help',
//     menu: '/menu'
// }

const menu = {
    daily: '⭐️ Daily',
    weekly: '⭐️ Weekly',
    monthly: '⭐️ Monthly',
    close: '❌ Close menu'
}

// const mode = {
//     daily: 'daily',
//     weekly: 'weekly',
//     monthly: 'monthly',
// }

// const response = {
//     start: 'Bot is running',
//     help: '*Hello World*',
//     menu: 'Bot Menu',
//     menuClose: 'Menu was closed',
//     unknownCommand: 'Sorry, but IDK this command:'
// }

const keyBoardMenu = {

    reply_markup: {
        
        keyboard: Object.values(menu).map(e => [e]),
        resize_keyboard: true

    }

}

async function getDataScrapperResponseBuilder(freq) {
    return {respond: async () => await scrapper.getData(freq), options: { parse_mode: "HTML", disable_web_page_preview: true }}
}

const responses = {
    "/start": {respond: async () => "Bot is running", options: { parse_menu: "HTML" }},
    "/help": {respond: async () => "*Hello World*", options: { parse_menu: "HTML" }},
    "/menu": {respond: async () => "Bot Menu", options: keyBoardMenu},
    [menu.daily]: getDataScrapperResponseBuilder('daily'),
    "⭐️ Weekly": getDataScrapperResponseBuilder('weekly'),
    "⭐️ Monthly": getDataScrapperResponseBuilder('monthly'),
    "❌ Close menu": {respond: async () => "Menu was closed", options: { reply_markup: { remove_keyboard: true } }},
  };

function runTelegramBot() {
    console.debug("Telegram bot are creating...")

    const bot = new TelegramBot(token, { polling: true })

    bot.setMyCommands(commands);

    bot.on('text', (msg) => { onMessage(bot, msg) })

    console.debug("Telegram bot was created!!!")
}

async function onMessage(bot, msg) {
    const response = responses[msg.text];
    console.debug(msg.text, response);
    // console.debug()
    const defaultResponse = {
        respond: async () => `Sorry, but IDK this command: ${msg.text}`,
        options: undefined
    }
    const {respond, options} = response ?? defaultResponse;
    await bot.sendMessage(msg.chat.id, await respond(), options);
}

runTelegramBot()