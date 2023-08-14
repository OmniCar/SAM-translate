import {
  exportTranslations,
  getLocale,
  getLocales,
  initTranslations,
  ITranslateConfig,
  setLocale,
  tUntyped,
} from '.'
import {
  emptyKey,
  locale,
  mockTranslations,
  nonExistingPhrase,
  nonExistingTokenPhrase,
  tokenKey,
  translatableKey,
  translatableValue,
} from '../test/setupJest'

const customErrorCallback = jest.fn((e) => {
  console.log(`error: ${e}`)
})

let errorCalls = 0

// Translation tests
test('Does not init the translations', async () => {
  global.fetch.mockResponseOnce(JSON.stringify(''))
  const configuration: ITranslateConfig = {
    translationAPIUrl: 'mock',
    errorCallback: customErrorCallback,
    token: '',
    localStorageKey: '',
  }
  await initTranslations(configuration)
  expect(exportTranslations()).toEqual(undefined)
})

test('Inits the translation configuration from mock url', async () => {
  global.fetch.mockResponseOnce(JSON.stringify(mockTranslations))
  const configuration: ITranslateConfig = {
    translationAPIUrl: 'mock',
    errorCallback: customErrorCallback,
    token: '',
    localStorageKey: '',
  }

  await initTranslations(configuration)
  expect(exportTranslations()).toEqual(mockTranslations)
})

test('Verify that a valid translation is translated', () => {
  expect(tUntyped(translatableKey)).toEqual(translatableValue)
})

test('An invalid translation should return original phrase', () => {
  expect(tUntyped(nonExistingPhrase)).toEqual(nonExistingPhrase)
  errorCalls++
  expect(customErrorCallback).toHaveBeenCalledTimes(errorCalls)
})

test('Correctly replaces words in a phrase', () => {
  const replacements = {
    num1: 4,
    num2: '3',
  }
  expect(tUntyped(tokenKey, replacements)).toEqual(
    'Du har 4 ulæste beskeder og 3 notifikationer',
  )
})

test('An invalid translation should return original phrase', () => {
  expect(tUntyped(nonExistingPhrase, undefined)).toEqual(nonExistingPhrase)
  errorCalls++
  expect(customErrorCallback).toHaveBeenCalledTimes(errorCalls)
})

test('Correctly replaces words in a non existing phrase', () => {
  const replacements = {
    num1: 4,
    num2: '3',
  }
  expect(tUntyped(nonExistingTokenPhrase, replacements)).toEqual(
    `You have ${replacements.num1} new contracts with ${replacements.num2} missing options`,
  )
})

test('Empty translation value should return original phrase', () => {
  expect(tUntyped(emptyKey)).toEqual(emptyKey)
})

test('Returns the correct list of locales', () => {
  expect(getLocales()).toEqual([locale])
})

test('Changes the locale correctly', () => {
  expect(setLocale('da-DK')).toBe(true)
  expect(getLocale()).toEqual('da-DK')
})

test('Changes the locale correctly to en', () => {
  expect(setLocale('en')).toBe(true)
  expect(getLocale()).toEqual('en')
})

test('Set the locale to an unkown locale', () => {
  expect(setLocale('nk-NO')).toBe(true)
  expect(getLocale()).toEqual('nk-NO')
})
