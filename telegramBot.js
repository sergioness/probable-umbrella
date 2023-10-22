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

const defaultCommand = {
    start: '/start',
    help: '/help',
    menu: '/menu'
}

const menu = {
    daily: '⭐️ Daily',
    weekly: '⭐️ Weekly',
    monthly: '⭐️ Monthly',
    close: '❌ Close menu'
}

const mode = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
}

const response = {
    start: 'Bot is running',
    help: '*Hello World*',
    menu: 'Bot Menu',
    menuClose: 'Menu was closed',
    unknownCommand: 'Sorry, but IDK this command:'
}

const keyBoardMenu = {

    reply_markup: {
        
        keyboard: Object.values(menu).map(e => [e]),
        resize_keyboard: true

    }

}

function runTelegramBot() {
    console.debug("Telegram bot are creating...")

    const bot = new TelegramBot(token, { polling: true })

    bot.setMyCommands(commands);

    bot.on('text', async msg => {

        try {

            switch (msg.text) {

                case defaultCommand.start:
                    await bot.sendMessage(msg.chat.id, response.start);
                break;

                case defaultCommand.help:
                    await bot.sendMessage(msg.chat.id, response.help, { parse_menu: "HTML" });
                break;

                case defaultCommand.menu:
                    await bot.sendMessage(msg.chat.id, response.menu, keyBoardMenu)
                break;

                case menu.daily:
                    await bot.sendMessage(msg.chat.id, await scrapper.getData(mode.daily), { parse_mode: "HTML", disable_web_page_preview: true });

                break;

                case menu.weekly:
                    await bot.sendMessage(msg.chat.id, await scrapper.getData(mode.weekly), { parse_mode: "HTML", disable_web_page_preview: true });
                break;

                case menu.monthly:
                    await bot.sendMessage(msg.chat.id, await scrapper.getData(mode.monthly), { parse_mode: "HTML", disable_web_page_preview: true });
                break;

                case menu.close:
                    await bot.sendMessage(msg.chat.id, response.menuClose, { reply_markup: { remove_keyboard: true } })
                break;

                default:
                    await bot.sendMessage(msg.chat.id, `${unknownCommand} ${msg.text}`);

            }
    
        }
        catch(error) {
    
            console.log(error);
    
        }
    
    })

    console.debug("Telegram bot was created!!!")
}

runTelegramBot()