const namesByPlatform = {
  spotify: 'Spotify',
  itunes: 'iTunes',
  appleMusic: 'Apple Music',
  youtube: 'YouTube',
  youtubeMusic: 'YouTube Music',
  google: 'Google',
  googleStore: 'Google Store',
  pandora: 'Pandora',
  deezer: 'Deezer',
  tidal: 'Tidal',
  amazonStore: 'Amazon Store',
  amazonMusic: 'Amazon Music',
  soundcloud: 'SoundCloud',
  napster: 'Napster',
  yandex: 'Yandex',
  spinrilla: 'Spinrilla'
}

function isStringPlatform (platform: any): platform is keyof typeof namesByPlatform {
  return Boolean((namesByPlatform as any)[platform])
}

export function getNameByPlatform (platform: string) {
  if (isStringPlatform(platform)) return namesByPlatform[platform]

  return undefined
}