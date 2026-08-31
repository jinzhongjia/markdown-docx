import { createHighlighter } from 'shiki'
import type {
  BundledLanguage,
  BundledTheme,
  Highlighter,
} from 'shiki'

export interface CodeHighlightOptions {
  enabled?: boolean           // 是否启用语法高亮
  theme?: BundledTheme        // 主题名称
  languages?: BundledLanguage[] // 支持的语言列表
  showLineNumbers?: boolean   // 是否显示行号
  showLanguage?: boolean      // 是否显示语言标识
  autoDetect?: boolean        // 自动检测语言
  defaultLanguage?: string    // 默认语言
}

// Define our own token interface that's compatible with shiki output
export interface HighlightToken {
  content: string
  color?: string
  fontStyle?: number
}

export interface HighlightedLine {
  tokens: HighlightToken[]
  lineNumber?: number
}

const DEFAULT_THEME: BundledTheme = 'github-light'
const DEFAULT_LANGUAGES: BundledLanguage[] = [
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'html',
  'css',
  'scss',
  'json',
  'xml',
  'yaml',
  'markdown',
  'sql',
  'bash',
  'shell',
  'powershell',
  'dockerfile',
  'graphql',
  'vue',
  'jsx',
  'tsx',
]

let sharedHighlighter: Highlighter | null = null
let sharedHighlighterPromise: Promise<Highlighter> | null = null
const languageLoads = new Map<BundledLanguage, Promise<void>>()
const themeLoads = new Map<BundledTheme, Promise<void>>()

async function getSharedHighlighter(): Promise<Highlighter> {
  if (sharedHighlighter) return sharedHighlighter

  if (!sharedHighlighterPromise) {
    sharedHighlighterPromise = createHighlighter({
      themes: [DEFAULT_THEME],
      langs: ['plaintext'],
    }).then((highlighter) => {
      sharedHighlighter = highlighter
      return highlighter
    }).catch((error) => {
      sharedHighlighterPromise = null
      throw error
    })
  }

  return sharedHighlighterPromise
}

function loadLanguage(
  highlighter: Highlighter,
  language: BundledLanguage,
): Promise<void> {
  if (highlighter.getLoadedLanguages().includes(language)) {
    return Promise.resolve()
  }

  const existing = languageLoads.get(language)
  if (existing) return existing

  const pending = highlighter.loadLanguage(language)
    .finally(() => languageLoads.delete(language))
  languageLoads.set(language, pending)
  return pending
}

function loadTheme(
  highlighter: Highlighter,
  theme: BundledTheme,
): Promise<void> {
  if (highlighter.getLoadedThemes().includes(theme)) {
    return Promise.resolve()
  }

  const existing = themeLoads.get(theme)
  if (existing) return existing

  const pending = highlighter.loadTheme(theme)
    .finally(() => themeLoads.delete(theme))
  themeLoads.set(theme, pending)
  return pending
}

export async function disposeSharedHighlighter(): Promise<void> {
  const highlighter = sharedHighlighter
  const highlighterPromise = sharedHighlighterPromise

  sharedHighlighter = null
  sharedHighlighterPromise = null
  languageLoads.clear()
  themeLoads.clear()

  const initializedHighlighter = highlighter
    ?? await highlighterPromise?.catch(() => null)
  initializedHighlighter?.dispose()
}

export class SyntaxHighlighter {
  private highlighter: Highlighter | null = null
  private options: CodeHighlightOptions
  private initPromise: Promise<void> | null = null

  constructor(options: CodeHighlightOptions = {}) {
    this.options = {
      enabled: true,
      theme: DEFAULT_THEME,
      languages: DEFAULT_LANGUAGES,
      showLineNumbers: false,
      showLanguage: false,
      autoDetect: true,
      defaultLanguage: 'plaintext',
      ...options
    }
  }

  async initialize(): Promise<void> {
    if (this.highlighter) return
    if (!this.initPromise) {
      this.initPromise = this._doInitialize().catch((error) => {
        this.initPromise = null
        throw error
      })
    }

    return this.initPromise
  }

  private async _doInitialize(): Promise<void> {
    try {
      const highlighter = await getSharedHighlighter()
      const languages = this.options.languages || []
      const theme = this.options.theme || DEFAULT_THEME

      await Promise.all([
        loadTheme(highlighter, theme),
        ...languages.map(language => loadLanguage(highlighter, language)),
      ])
      this.highlighter = highlighter
    } catch (error) {
      console.error('[SyntaxHighlighter] Failed to initialize:', error)
      throw error
    }
  }

  async highlightCode(
    code: string, 
    lang?: string,
    theme?: BundledTheme
  ): Promise<HighlightedLine[]> {
    if (!this.options.enabled) {
      // If highlighting is disabled, return plain text
      return code.split('\n').map((line, index) => ({
        tokens: [{
          content: line,
          color: undefined,
          fontStyle: undefined
        }],
        lineNumber: this.options.showLineNumbers ? index + 1 : undefined
      }))
    }

    // Ensure highlighter is initialized
    await this.initialize()
    
    if (!this.highlighter) {
      throw new Error('[SyntaxHighlighter] Highlighter not initialized')
    }

    // Determine the language to use
    let targetLang = lang || this.options.defaultLanguage || 'plaintext'
    
    // Map common aliases to supported languages
    const langAliases: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'yml': 'yaml',
      'sh': 'bash',
      'zsh': 'bash',
      'ps1': 'powershell',
      'cs': 'csharp',
      'md': 'markdown',
      'dockerfile': 'docker',
      'makefile': 'make',
    }

    targetLang = langAliases[targetLang.toLowerCase()] || targetLang.toLowerCase()

    if (!this.highlighter.getLoadedLanguages().includes(targetLang as BundledLanguage)) {
      try {
        await loadLanguage(this.highlighter, targetLang as BundledLanguage)
      } catch (error) {
        console.warn(`[SyntaxHighlighter] Language "${targetLang}" not supported, falling back to plaintext`)
        targetLang = 'plaintext'
      }
    }

    try {
      const targetTheme = theme || this.options.theme || DEFAULT_THEME

      await loadTheme(this.highlighter, targetTheme)

      // Use codeToTokens with theme
      const result = this.highlighter.codeToTokens(code, {
        lang: targetLang as BundledLanguage,
        theme: targetTheme
      })

      return result.tokens.map((line, index) => ({
        tokens: line.map(token => ({
          content: token.content,
          color: token.color,
          fontStyle: token.fontStyle
        })),
        lineNumber: this.options.showLineNumbers ? index + 1 : undefined
      }))
    } catch (error) {
      console.error('[SyntaxHighlighter] Highlighting failed:', error)
      // Fallback to plain text
      return code.split('\n').map((line, index) => ({
        tokens: [{
          content: line,
          color: undefined,
          fontStyle: undefined
        }],
        lineNumber: this.options.showLineNumbers ? index + 1 : undefined
      }))
    }
  }

  /**
   * Get color for different token types
   * This provides a fallback color scheme if Shiki fails
   */
  getTokenColor(tokenType: string): string | undefined {
    const colorMap: Record<string, string> = {
      'keyword': '0000FF',      // Blue
      'string': '008000',        // Green  
      'comment': '808080',       // Gray
      'function': '795E26',      // Brown
      'number': '098658',        // Dark Green
      'operator': '000000',      // Black
      'variable': '001080',      // Dark Blue
      'class': '267F99',         // Teal
      'constant': '0070C1',      // Light Blue
      'type': '267F99',          // Teal
    }
    
    return colorMap[tokenType]
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.highlighter = null
    this.initPromise = null
  }
}
