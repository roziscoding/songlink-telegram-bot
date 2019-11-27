import { format } from 'util'
import { ContextMessageUpdate, Markup } from 'telegraf'
import { InlineQueryResultPhoto } from 'telegraf/typings/telegram-types'

const FORMAT = "%s sent some music, I'm creating a song.link URL and will send it here soon."

export function factory () {
  return async (ctx: ContextMessageUpdate) => {
    const query = ctx.inlineQuery?.query
    if (!query || !query.startsWith('http')) return

    const name = ctx.inlineQuery?.from.first_name
    const caption = format(FORMAT, name)
    
    const keyboard = Markup.inlineKeyboard([
      Markup.callbackButton('OK', 'ok', false)
    ])

    const result: InlineQueryResultPhoto = {
      id: Buffer.from(query).toString('base64').substr(0, 64),
      type: 'photo',
      title: 'Send as song.link URL',
      description: 'Create a song.link URL and send it on this chat',
      reply_markup: keyboard,
      photo_url: 'https://via.placeholder.com/500x250.jpg?text=Loading+album+art',
      thumb_url: 'https://via.placeholder.com/250x175.jpg?text=song.link+url',
      caption,
      parse_mode: 'Markdown'
    }

    ctx.answerInlineQuery([result])
  }
}

export default { factory }