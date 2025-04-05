import { expect, test } from 'vitest'

import { buildFixture } from './utils'

test('basic', async () => {
  const { status } = await buildFixture('basic')

  expect(status).toBe('success')
})

test('base option', async () => {
  const { status } = await buildFixture('base-path')

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
  const { status } = await buildFixture('i18n-base-path')

  expect(status).toBe('success')
})

test('i18n with root locale with base option', async () => {
  const { status } = await buildFixture('i18n-root-base-path')

  expect(status).toBe('success')
})

test('trailing slash ignore', async () => {
  const { status } = await buildFixture('trailing-slash-ignore')

  expect(status).toBe('success')
})

test('trailing slash always', async () => {
  const { status } = await buildFixture('trailing-slash-always')

  expect(status).toBe('success')
})

test('trailing slash never', async () => {
  const { status } = await buildFixture('trailing-slash-never')

  expect(status).toBe('success')
})
