import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const shikiMocks = vi.hoisted(() => ({
  createHighlighter: vi.fn(),
}))

vi.mock('shiki', () => ({
  createHighlighter: shikiMocks.createHighlighter,
}))

import {
  disposeSharedHighlighter,
  SyntaxHighlighter,
} from './syntax-highlighter'

interface FakeHighlighter {
  codeToTokens: Mock
  dispose: Mock
  getLoadedLanguages: Mock
  getLoadedThemes: Mock
  loadLanguage: Mock
  loadTheme: Mock
}

const highlighters: FakeHighlighter[] = []

function createFakeHighlighter(options: {
  langs: string[]
  themes: string[]
}): FakeHighlighter {
  const languages = new Set(options.langs)
  const themes = new Set(options.themes)
  const highlighter: FakeHighlighter = {
    codeToTokens: vi.fn((code: string) => ({
      tokens: code.split('\n').map(content => [{ content, color: '#000000' }]),
    })),
    dispose: vi.fn(),
    getLoadedLanguages: vi.fn(() => [...languages]),
    getLoadedThemes: vi.fn(() => [...themes]),
    loadLanguage: vi.fn(async (language: string) => {
      languages.add(language)
    }),
    loadTheme: vi.fn(async (theme: string) => {
      themes.add(theme)
    }),
  }
  highlighters.push(highlighter)
  return highlighter
}

beforeEach(async () => {
  await disposeSharedHighlighter()
  highlighters.length = 0
  shikiMocks.createHighlighter.mockReset()
  shikiMocks.createHighlighter.mockImplementation(
    async options => createFakeHighlighter(options),
  )
})

afterEach(async () => {
  await disposeSharedHighlighter()
})

describe('SyntaxHighlighter lifecycle', () => {
  it('reuses one Shiki highlighter across converter instances', async () => {
    const highlighterInstances = Array.from(
      { length: 25 },
      (_, index) => new SyntaxHighlighter({
        languages: [index % 2 === 0 ? 'javascript' : 'typescript'],
        showLineNumbers: index % 2 === 0,
        theme: index % 2 === 0 ? 'github-light' : 'nord',
      }),
    )

    const results = await Promise.all(
      highlighterInstances.map((highlighter, index) =>
        highlighter.highlightCode(`const value = ${index}`, index % 2 === 0 ? 'js' : 'ts')),
    )

    expect(shikiMocks.createHighlighter).toHaveBeenCalledTimes(1)
    expect(highlighters).toHaveLength(1)
    expect(highlighters[0].loadLanguage).toHaveBeenCalledTimes(2)
    expect(highlighters[0].loadTheme).toHaveBeenCalledTimes(1)
    expect(results[0][0].lineNumber).toBe(1)
    expect(results[1][0].lineNumber).toBeUndefined()
  })

  it('disposes the shared highlighter only at shared shutdown', async () => {
    const first = new SyntaxHighlighter({ languages: ['javascript'] })
    const second = new SyntaxHighlighter({ languages: ['typescript'] })

    await Promise.all([
      first.highlightCode('const first = true', 'js'),
      second.highlightCode('const second = true', 'ts'),
    ])
    first.dispose()
    await second.highlightCode('const stillWorks = true', 'ts')

    expect(shikiMocks.createHighlighter).toHaveBeenCalledTimes(1)
    expect(highlighters[0].dispose).not.toHaveBeenCalled()

    await disposeSharedHighlighter()
    expect(highlighters[0].dispose).toHaveBeenCalledTimes(1)

    const replacement = new SyntaxHighlighter({ languages: ['javascript'] })
    await replacement.highlightCode('const replacement = true', 'js')
    expect(shikiMocks.createHighlighter).toHaveBeenCalledTimes(2)
  })
})
