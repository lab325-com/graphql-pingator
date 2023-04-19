import * as dotenv from 'dotenv'
dotenv.config()

import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import PostgresSession from "telegraf-postgres-session";
import log from "../log.js";

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN);

bot.use((new PostgresSession({
    user: process.env.DEV_POSTGRES_USER,
    password: process.env.DEV_POSTGRES_PASSWORD,
    host: process.env.DEV_POSTGRES_HOST,
    database: process.env.DEV_POSTGRES_DB,
    ssl: false
})).middleware());

bot.command('quit', async (ctx) => {
    await ctx.leaveChat();
});

bot.on(message('text'), async (ctx) => {
    if (!ctx.session.messageCount)
        ctx.session.messageCount = 0

    log.info(ctx)

    ctx.session.messageCount++
    await ctx.reply(`Hello ${ctx.update.message.from.first_name}, count: ${ctx.session.messageCount}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;