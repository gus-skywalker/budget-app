export const APP_VOICES = ['default', 'warm', 'nordeste', 'gaucho', 'carioca_funk', 'founder'] as const
export type AppVoice = (typeof APP_VOICES)[number]

export const APP_VOICE_STORAGE_KEY = 'appVoice'

export const normalizeAppVoice = (value?: string | null): AppVoice =>
  APP_VOICES.includes(value as AppVoice) ? (value as AppVoice) : 'default'
