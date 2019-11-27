import debug from 'debug'
import { format } from 'util'
import { getClient } from 'songlink-api'
import { getNameByPlatform } from '../../lib/plaform-names'
import { ContextMessageUpdate, UrlButton, Markup } from 'telegraf'

type Type = 'album' | 'song'

const TEXT_FORMATS = {
  song: '%s sent you 🎵 %s 🎵, a  song by %s\n',
  album: '%s sent you 💿 %s 💿, an album by %s\n'
}

function getText (type: Type, name: string, title: string, artist: string) {
  const messageFormat = TEXT_FORMATS[type]
  return [
    format(messageFormat, name, title, artist),
    'Click one of the buttons below to open it on your preferred platform :D'
  ].join('\n')
}

const log = debug('songlink-bot:presentation:handlers:chosen-url')

export function factory (getLinks: ReturnType<typeof getClient>) {
  return async (ctx: ContextMessageUpdate) => {
    const query = ctx.chosenInlineResult?.query
    const message = ctx.chosenInlineResult?.inline_message_id
    const name = ctx.chosenInlineResult?.from.first_name ?? 'Someone'

    if (!query || !message) return

    log('Querying song.link for %s', query)
    const links = await getLinks({ url: query })

    log('Got results %O', links)

    const buttons = Object.entries(links.linksByPlatform)
      .map(([ platform, link ]): UrlButton => {
        const platformName = getNameByPlatform(platform as any) ?? platform

        return {
          text: platformName,
          url: link.url,
          hide: false
        }
      })

    buttons.unshift({
      text: 'song.link',
      url: links.pageUrl,
      hide: false
    })

    const splitButtons = buttons.reduce<UrlButton[][]>((result, button) => {
      const lastItem = result[result.length - 1]
      if (lastItem && lastItem.length === 1) {
        lastItem.push(button)
        return result
      }

      result.push([button])
      return result
    }, [])

    const keyboard = Markup.inlineKeyboard(splitButtons)

    const entityWithThumbnail = Object.values(links.entitiesByUniqueId)
      .find(entityData => !!entityData.thumbnailUrl)

    const thumbnailUrl = entityWithThumbnail?.thumbnailUrl

    log(thumbnailUrl)

    const [ { entityUniqueId } ] = Object.values(links.linksByPlatform)
    const {
      type,
      title = 'unknown',
      artistName = 'unknown'
    } = links.entitiesByUniqueId[ entityUniqueId ]

    const messageText = getText(
      type,
      name,
      title,
      artistName
    )

    const media = {
      type: 'photo',
      media: thumbnailUrl,
      caption: messageText,
      parse_mode: 'Markdown'
    }

    await (ctx.telegram as any).editMessageMedia(
      undefined,
      undefined,
      message,
      media,
      { reply_markup: keyboard }
    )
  }
}

export default { factory }
