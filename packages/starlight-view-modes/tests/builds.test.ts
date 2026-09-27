import { expect, test } from 'vitest'

import { buildFixture, readFixtureOutput } from './utils'

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

test('prefixes content links with the Sätteri Markdown processor', async () => {
  const { status } = await buildFixture('basic')

  expect(status).toBe('success')
  expect(readFixtureOutput('basic', 'zen-mode/demo/index.html')).toContain('<a href="/zen-mode/">Home</a>')
})

test('prefixes content links with the unified Markdown processor', async () => {
  const { status } = await buildFixture('markdown-unified')
  const html = readFixtureOutput('markdown-unified', 'zen-mode/demo/index.html')

  expect(status).toBe('success')
  expect(html).toContain('<a href="/zen-mode/">Home</a>')
  expect(html).toContain('<a href="mailto:hello@example.com">Mail</a>')
})

test('does not render the search when Pagefind is disabled', async () => {
  const { status } = await buildFixture('pagefind-disabled')
  const html = readFixtureOutput('pagefind-disabled', 'demo/index.html')

  expect(status).toBe('success')
  expect(html).not.toContain('<site-search')
  expect(html).toContain('<starlight-view-modes-search')
})

test('renders presentation mode pages as slides', async () => {
  const { status } = await buildFixture('basic')
  const html = readFixtureOutput('basic', 'presentation-mode/demo/index.html')

  expect(status).toBe('success')
  expect(html).toContain('<starlight-view-modes-presentation')
  expect(html).toContain('<h1>Demo</h1>')
  expect(html).toContain('<a href="/presentation-mode/">Home</a>')
})

test('renders presentation mode pages for all locales', async () => {
  const { status } = await buildFixture('i18n')

  expect(status).toBe('success')
  expect(readFixtureOutput('i18n', 'en/presentation-mode/demo/index.html')).toContain('lang="en"')
  expect(readFixtureOutput('i18n', 'zh-cn/presentation-mode/demo/index.html')).toContain('lang="zh-CN"')
})

test('switches the language of multilingual presentations', async () => {
  const { status } = await buildFixture('i18n')
  const html = readFixtureOutput('i18n', 'en/presentation-mode/demo/index.html')

  expect(status).toBe('success')
  expect(html).toMatch(/starlight-view-modes-presentation-menu[\s\S]*<starlight-lang-select/)
  expect(html).toContain('value="/zh-cn/presentation-mode/demo/"')
})

test('supports presentation directives in MDX pages', async () => {
  const { status } = await buildFixture('presentation')
  const docs = readFixtureOutput('presentation', 'components/index.html')
  const presentation = readFixtureOutput('presentation', 'presentation-mode/components/index.html')

  expect(status).toBe('success')
  expect(docs).toContain('Hidden from the presentation.')
  expect(presentation).not.toContain('Hidden from the presentation.')
  expect(presentation).toMatch(/Directives<span class="starlight-view-modes-presentation-counter">2\/2<\/span><\/h2>\s*<p>After the break.<\/p>/)
  expect(presentation).toContain('<aside class="notes">A speaker note.</aside>')
})

test('presents the pages of a sidebar group as a single presentation when enabled', async () => {
  const { status } = await buildFixture('presentation')
  const getSequence = (page: string) =>
    /<div class="starlight-view-modes-presentation-sequence"[^>]*>/.exec(
      readFixtureOutput('presentation', `presentation-mode/${page}/index.html`)
    )?.[0]
  const lesson = getSequence('lesson') ?? ''
  const homework = getSequence('homework') ?? ''
  const pages = JSON.stringify([
    { href: '/presentation-mode/lesson/', slides: Number(/data-slides="(\d+)"/.exec(lesson)?.[1]) },
    { href: '/presentation-mode/homework/', slides: Number(/data-slides="(\d+)"/.exec(homework)?.[1]) },
  ]).replaceAll('"', '&quot;')

  expect(status).toBe('success')
  expect(lesson).toContain('data-next="/presentation-mode/homework/"')
  expect(lesson).toContain(`data-pages="${pages}"`)
  expect(homework).toContain('data-previous="/presentation-mode/lesson/"')
  expect(homework).toContain(`data-pages="${pages}"`)
  expect(readFixtureOutput('presentation', 'presentation-mode/lesson/index.html')).not.toContain('Up next')
  expect(getSequence('components')).toBeUndefined()
})

test('presents pages separately by default', async () => {
  const { status } = await buildFixture('basic')

  expect(status).toBe('success')
  expect(readFixtureOutput('basic', 'presentation-mode/demo/index.html')).not.toContain(
    'starlight-view-modes-presentation-sequence'
  )
})
