import debug from 'debug'
import { handlers } from './handlers'
import * as Sentry from '@sentry/node'
import { IAppConfig } from '../app.config'
import Telegraf, { ContextMessageUpdate, Extra, Markup } from 'telegraf'
import { getClient } from 'songlink-api'

const log = debug('songlink-bot:presentation:app')

declare module 'telegraf/typings' {
  export interface Telegraf<TContext extends ContextMessageUpdate> extends Composer<TContext> {
    entity: (entity: string | string[] | RegExp | RegExp[] | Function, ...middleware: Middleware<TContext>[]) => void
  }
}

function switchToInline (ctx: ContextMessageUpdate) {
  const value = ctx.message?.text === '/start' || ctx.message?.text === '/help'
    ? ''
    : ctx.message?.text?.replace(/\/start ?/ig, '')

  ctx.replyWithMarkdown(
    'Hi there! I work on inline mode. Click the button to begin!',
    Extra.markup(Markup.inlineKeyboard([
      Markup.switchToChatButton('Go inline', value ?? 'LINK_TO_YOUR_SONG') as any
    ])) as any
  )
}

function setUser (ctx: ContextMessageUpdate, scope: Sentry.Scope) {
  if (!ctx.from || !ctx.chat) return

  const id = ctx.chat.type === 'private' ? ctx.from.id : ctx.chat.id
  const username = ctx.chat.type === 'private' ? ctx.from.username : ctx.chat.title

  scope.setUser({
    id: `${id}`,
    username
  })
}

export async function factory (config: IAppConfig) {
  const bot = new Telegraf(config.telegram.token, { telegram: { webhookReply: false } })

  bot.use((ctx, next: any) => {
    Sentry.configureScope(scope => {
      setUser(ctx, scope)
      scope.setExtra('update', ctx.update)
    })

    next(ctx)
      .catch((err: any) => {
        console.error(`Error processing update ${ctx.update.update_id}: ${err.message}`)
        Sentry.captureException(err)
        if (ctx.chat && ctx.message) {
          ctx.telegram.sendMessage(ctx.chat.id, 'Error processing message', { reply_to_message_id: ctx.message.message_id })
            .catch(console.error)
        }
      })
  })

  // Smiles to the user
  bot.action('ok', ctx => ctx.answerCbQuery('OK, hold on :D'))
  
  bot.start(switchToInline)
  bot.help(switchToInline)
  
  // Send repository link
  bot.command('repo', (ctx) => ctx.replyWithMarkdown('You can see my source code [here](https://github.com/rjmunhoz/songlink-telegram-bot)'))
  
  // Hints user about inline mode
  bot.hears(/https?:\/\/.*/, switchToInline)

  bot.hears(/.*/, ctx => {
    if (ctx.message?.text) ctx.message.text = '/start'
    return switchToInline(ctx)
  })

  bot.on('inline_query', (ctx) => {
    log('Handling inline query from %s', ctx.from?.first_name)
    return handlers.url.factory()(ctx)
  })

  bot.on('chosen_inline_result', handlers.chosenResult.factory(getClient({ apiKey: config.songLink.apiKey })))

  return bot
}

export default { factory }
