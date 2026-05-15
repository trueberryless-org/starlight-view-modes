import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { expect, test } from 'vitest'

test('search styles avoid mobile overlap and nested connector line artifacts', () => {
  const searchComponent = readFileSync(
    fileURLToPath(new URL('../components/starlight/Search.astro', import.meta.url)),
    'utf-8'
  )

  expect(searchComponent).toContain('button[data-close-modal] {')
  expect(searchComponent).toContain('position: static;')
  expect(searchComponent).toContain('--sl-search-cancel-space: 0px;')
  expect(searchComponent).not.toContain('.pagefind-ui__result-nested::before')
})
