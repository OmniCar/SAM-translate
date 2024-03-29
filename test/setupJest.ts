import * as fetchMock from 'jest-fetch-mock'
import { ILocaleTranslation } from '@omnicar/sam-types'

global.fetch = fetchMock as any

export const locale = 'da-DK'
export const translatableKey = 'Contract template'
export const translatableValue = 'Kontrakt type'
export const tokenKey = 'You have %num1 unread messages and %num2 notifications'
export const tokenValue = 'Du har %num1 ulæste beskeder og %num2 notifikationer'
export const nonExistingTokenPhrase =
  'You have %num1 new contracts with %num2 missing options'
export const nonExistingPhrase = 'This phrase is not translatable'
export const emptyKey = 'Contract state'
export const emptyValue = ''

export let mockTranslations: ILocaleTranslation
mockTranslations = {}
mockTranslations[locale] = {}
mockTranslations[locale][translatableKey] = translatableValue
mockTranslations[locale][tokenKey] = tokenValue
mockTranslations[locale][emptyKey] = emptyValue
