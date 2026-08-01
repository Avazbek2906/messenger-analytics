import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { LOCALES } from './config'
import { en } from './locales/en'
import { ru } from './locales/ru'
import { uz } from './locales/uz'
import { formatMessage } from './translate'
import { useTranslation } from './use-translation'

const DICTIONARIES = { uz, ru, en } as const

/** The list of `{name}` placeholders in a message. */
function placeholders(value: unknown): (string | undefined)[] {
  return [...String(value).matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1])
    .toSorted()
}

describe('dictionaries', () => {
  it('share the exact same key set across locales', () => {
    const reference = Object.keys(uz).toSorted()

    for (const locale of LOCALES) {
      expect(Object.keys(DICTIONARIES[locale]).toSorted()).toEqual(reference)
    }
  })

  it('contain no empty translation', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(DICTIONARIES[locale])) {
        const text = typeof value === 'string' ? value : value.other
        expect(text.trim(), `${locale}: ${key}`).not.toBe('')
      }
    }
  })

  it('keep every placeholder in every locale', () => {
    // `{count}` uzbekcha matnda bo‘lib, ruschada tushib qolsa — raqam
    // ekranga umuman chiqmaydi. Shuni oldindan ushlaymiz.
    for (const [key, source] of Object.entries(uz)) {
      const expected = placeholders(source)
      if (expected.length === 0) continue

      for (const locale of LOCALES) {
        expect(
          placeholders(DICTIONARIES[locale][key as keyof typeof uz]),
          `${locale}: ${key}`,
        ).toEqual(expected)
      }
    }
  })
})

describe('formatMessage', () => {
  it('fills placeholders', () => {
    expect(formatMessage('Jami {count} ta', 'uz', 'key', { count: 12 })).toBe(
      'Jami 12 ta',
    )
  })

  it('returns the key itself when it is unknown', () => {
    expect(formatMessage(undefined, 'uz', 'some.missing.key')).toBe(
      'some.missing.key',
    )
  })

  it('picks the right one of three Russian plural forms', () => {
    // Bu `count === 1` tekshiruvi yetarli bo‘lmagan yagona holat.
    const message = {
      one: '{count} диалог',
      few: '{count} диалога',
      many: '{count} диалогов',
      other: '{count} диалога',
    }

    expect(formatMessage(message, 'ru', 'k', { count: 1 })).toBe('1 диалог')
    expect(formatMessage(message, 'ru', 'k', { count: 3 })).toBe('3 диалога')
    expect(formatMessage(message, 'ru', 'k', { count: 7 })).toBe('7 диалогов')
    expect(formatMessage(message, 'ru', 'k', { count: 21 })).toBe('21 диалог')
  })
})

function Probe() {
  const { t, locale } = useTranslation()
  return (
    <p>
      {locale}: {t('auth.submit')}
    </p>
  )
}

describe('I18nProvider', () => {
  // Non-default dictionaries are code-split, so the provider renders its
  // fallback until the chunk resolves — hence `findByText` rather than `getBy`.
  it('returns text in the selected locale', async () => {
    renderWithProviders(<Probe />, { locale: 'ru' })
    expect(await screen.findByText('ru: Войти')).toBeInTheDocument()
  })

  it('works for English too', async () => {
    renderWithProviders(<Probe />, { locale: 'en' })
    expect(await screen.findByText('en: Sign in')).toBeInTheDocument()
  })

  it('renders the default locale without any loading state', () => {
    // `uz` is statically imported, so most users never see the splash.
    renderWithProviders(<Probe />, { locale: 'uz' })
    expect(screen.getByText('uz: Kirish')).toBeInTheDocument()
  })
})
