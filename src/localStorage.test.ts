import { mockTranslations } from '../test/setupJest'
import {
  getTranslationsFromLocalStorage,
  persistTranslationsToLocalStorage,
} from './localStorage'

// Local storage tests
test('Stores translations to local storage', () => {
  const testKey = 'test'
  expect(persistTranslationsToLocalStorage(mockTranslations, testKey))
    .toBeTruthy
  expect(localStorage.__STORE__['__translations__test']).toEqual(
    JSON.stringify(mockTranslations),
  )
  expect(localStorage.__STORE__['__trans_time__test']).toBeDefined
})

test('Correctly returns stored values', () => {
  expect(getTranslationsFromLocalStorage('test')).toEqual(mockTranslations)
})

test('LocalStorage returns undefined if cache has expired', () => {
  expect(getTranslationsFromLocalStorage('test', -1)).toEqual(undefined)
})
