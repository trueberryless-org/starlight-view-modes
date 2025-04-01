import { expect, test } from 'vitest'

import { buildFixture } from './utils'

test('basic', async () => {
  const { status } = await buildFixture('basic')

  expect(status).toBe('success')
})

test('base option', async () => {
  const { status } = await buildFixture('base-option')

  expect(status).toBe('success')
})

test('i18n', async () => {
  const { status } = await buildFixture('i18n')

  expect(status).toBe('success')
})

test('i18n with root locale', async () => {
  const { status } = await buildFixture('i18n-root')

  expect(status).toBe('success')
})

test('i18n with base option', async () => {
  const { status } = await buildFixture('i18n-base-option')

  expect(status).toBe('error')
})

test('i18n with root locale with base option', async () => {
  const { status } = await buildFixture('i18n-root-base-option')

  expect(status).toBe('error')
})
