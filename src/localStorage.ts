import { ILocaleTranslation } from '@omnicar/sam-types'

const STORAGE_KEY = '__translations__'
const TIME_KEY = '__trans_time__'

const now = () => Math.round(new Date().getTime() / 1000)

export const persistTranslationsToLocalStorage = (
  json: ILocaleTranslation,
  key: string,
) => {
  try {
    const serializedData = JSON.stringify(json)

    localStorage.setItem(getStorageKey(key), serializedData)
    localStorage.setItem(getTimeKey(key), `${now()}`)

    return true
  } catch (e) {
    return false
  }
}

export const getTranslationsFromLocalStorage = (
  localStorageKey: string,
  cacheExpiration?: number,
) => {
  try {
    const persistedTranslations = localStorage.getItem(
      getStorageKey(localStorageKey),
    )
    if (persistedTranslations !== null) {
      if (cacheExpiration) {
        const persistedTime = localStorage.getItem(getTimeKey(localStorageKey))
        const atm = now()
        if (Number(persistedTime) < atm - cacheExpiration) {
          return undefined
        }
      }
      return JSON.parse(persistedTranslations) as ILocaleTranslation
    } else {
      return undefined
    }
  } catch (error) {
    // If we're unable to detect when data was persisted we return undefined
    return undefined
  }
}

const getStorageKey = (key: string) => `${STORAGE_KEY}${key}`

const getTimeKey = (key: string) => `${TIME_KEY}${key}`
