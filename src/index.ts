import { ILocaleTranslation, IsoLocale, ITranslation } from '@omnicar/sam-types'
import {
  getTranslationsFromLocalStorage,
  persistTranslationsToLocalStorage,
} from './localStorage'

export interface ITranslateConfig {
  translationAPIUrl?: string
  errorCallback?: (error: string) => void
  cacheExpirationTime?: number
  useLocalStorage?: boolean
  locale?: IsoLocale
  token: string
  localStorageKey: string
}

export interface IReplacement {
  [Key: string]: string | number
}

let translations: ILocaleTranslation | undefined
let configuration: ITranslateConfig = {
  // errorCallback: alert.bind(window), // Spams UI with useless alerts, TODO: Find better way to log
  useLocalStorage: true,
  cacheExpirationTime: 60 * 60, // 1 hour
  token: '',
  localStorageKey: '',
}
let reportedMissingTranslations: Set<string> = new Set<string>()

/**
 * Inits the configuration parameters and fetches the translations
 * @param conf ITranslateConfig configuration for the library
 */
export const initTranslations = async (
  conf: ITranslateConfig,
): Promise<boolean> => {
  configuration = {
    ...configuration,
    ...conf,
  }
  const { localStorageKey, cacheExpirationTime, translationAPIUrl, locale } =
    configuration
  const translationsFromLocalStorage = getTranslationsFromLocalStorage(
    localStorageKey,
    cacheExpirationTime,
  )

  if (!translationAPIUrl) {
    logError(
      'Unable to fetch translations because of missed translationApplication',
    )
    return false
  }

  let status = false
  // If mock/prepared translations are available, use those
  if (translationsFromLocalStorage) {
    translations = translationsFromLocalStorage
    status = true
  } else {
    status = await fetchTranslations()
  }
  // Default locale to first locale in translations if not set
  if (status && !locale && translations) {
    configuration.locale = Object.keys(translations)[0] as IsoLocale
  }
  return status
}

/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
export const fetchTranslations = async (): Promise<boolean> => {
  const {
    useLocalStorage,
    translationAPIUrl,
    cacheExpirationTime,
    localStorageKey,
  } = configuration

  if (!translationAPIUrl) {
    logError(
      'Unable to fetch translations because of missed translationApplication',
    )
    return false
  }

  if (useLocalStorage) {
    translations = getTranslationsFromLocalStorage(
      localStorageKey,
      cacheExpirationTime,
    )
    if (translations) {
      return true
    }
  }

  translations = await getTranslationsFromAPI(translationAPIUrl)

  if (translations) {
    return true
  } else {
    return false
  }
}

/**
 * Fetches translations JSON from API, and persists it to
 * local storage if setting is enabled
 */
const getTranslationsFromAPI = async (
  translationAPIUrl: string,
): Promise<ILocaleTranslation | undefined> => {
  const { useLocalStorage, token, localStorageKey } = configuration

  try {
    const response = await fetch(translationAPIUrl, {
      mode: 'cors',
      headers: {
        'translations-token': token,
      },
    })

    const json: ILocaleTranslation = await response.json()

    useLocalStorage && persistTranslationsToLocalStorage(json, localStorageKey)

    return json
  } catch (error) {
    logError(
      `Unable to fetch translations from url: ${translationAPIUrl}. Error: ${error.message}`,
    )
    return undefined
  }
}

/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
export const exportTranslations = (
  locale?: string,
): ILocaleTranslation | ITranslation | undefined => {
  if (!translations) {
    return undefined
  }
  if (locale && translations.hasOwnProperty(locale)) {
    return translations[locale]
  } else {
    return translations
  }
}

export const getLocales = () => {
  if (translations) {
    return Object.keys(translations)
  }
  return undefined
}

export const setLocale = (locale: string) => {
  const locales = getLocales()
  if (!locales) {
    logError(
      `Unable to set locale with locale: ${locale}. No locales available`,
    )
    return false
  }
  if (!locales.find((l) => l === locale) && !(locale.substr(0, 2) === 'en')) {
    logError(
      `Unable to set locale with locale: ${locale}. Locale not available`,
    )
  }
  configuration.locale = locale as IsoLocale
  return true
}

export const getConfiguration = () => configuration

export const getLocale = () =>
  configuration ? configuration.locale : undefined

/**
 * Translates a given phrase using replacements and a locale
 * @param key phrase to translate
 * @param replacements optional replacements as key/value object
 * @param locale optional locale to use for translations
 */
export const tUntyped = (
  key: string,
  replacements?: IReplacement,
  context?: string,
  locale?: string,
) => {
  if (key === '') {
    return key
  }
  if (!translations) {
    return replaceParams(key, replacements)
  }
  if (!locale) {
    if (!configuration.locale) {
      logError(`No locale specified when looking up key: ${key}`)
      return replaceParams(key, replacements)
    }
    locale = configuration.locale
  }
  if (!translations.hasOwnProperty(locale)) {
    return replaceParams(key, replacements)
  }
  let processedKey = context ? `${key}<${context}>` : key
  if (!translations[locale].hasOwnProperty(processedKey)) {
    if (!context) {
      logError(`Missing translation for locale: "${locale}" with key: "${key}"`)
      return replaceParams(key, replacements)
    }
    // If a context was provided, we check if a translation is available for the key without context
    if (!translations[locale].hasOwnProperty(key)) {
      logError(
        `Missing translation for locale: "${locale}" with key: "${key}" and context: "${context}"`,
      )
      return replaceParams(key, replacements)
    } else {
      // We found a translation by not using the context
      logError(
        `Missing translation for locale: "${locale}" with context: "${context}". However, the translation was found for key: "${key}"`,
      )
      processedKey = key
    }
  }
  let result = translations[locale][processedKey]
  result = replaceParams(result, replacements)
  return result
}

const replaceParams = (phrase: string, replacements?: IReplacement) => {
  if (!replacements) {
    return phrase
  }
  let result = phrase
  for (const key in replacements) {
    if (replacements.hasOwnProperty(key)) {
      result = result.replace(`%${key}`, `${replacements[key]}`)
    }
  }
  return result
}

/**
 * Logs an error depending on the different settings
 * If an errorCallback is available it will be called
 * If the configuration has been set to notify and it has an endpoint
 * it will POST the error message to that endpoint
 * @param error error message
 */
const logError = (error: string) => {
  if (!configuration) {
    return
  }
  const { errorCallback } = configuration
  if (errorCallback) {
    errorCallback(error)
  }
  reportedMissingTranslations.add(error)
}
