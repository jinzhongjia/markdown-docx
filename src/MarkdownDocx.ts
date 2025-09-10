import { Document, FileChild, IPropertiesOptions, IStylesOptions, Paragraph, ParagraphChild } from 'docx'
import { Tokens } from 'marked'

import { renderBlocks, renderTokens } from './renders'
import { SyntaxHighlighter } from './services/syntax-highlighter'
import { createDocumentStyle, numbering, styles } from './styles'
import { tokenize } from './tokenize'
import { IBlockAttr, IBlockToken, IInlineToken, ITextAttr, MarkdownDocxOptions, MarkdownImageItem } from './types'
import { getImageTokens } from './utils'

export class MarkdownDocx  {

  public static defaultOptions: MarkdownDocxOptions = {
    gfm: true
  }

  public styles = styles

  public static covert(
    markdown: string,
    _options: MarkdownDocxOptions = {}
  ) {
    return new MarkdownDocx(markdown, _options).toDocument()
  }

  protected _imageStore = new Map<string, MarkdownImageItem | null>()

  private footnotes:Record<string, { children: Paragraph[]}> = {}

  public syntaxHighlighter: SyntaxHighlighter

  public constructor (
    public markdown: string,
    public options: MarkdownDocxOptions = {}
  ) {
    this.options = {
      ...MarkdownDocx.defaultOptions,
      ...options,
    }
    
    // Initialize syntax highlighter with options
    this.syntaxHighlighter = new SyntaxHighlighter(this.options.codeHighlight || {})
  }

  get ignoreImage () {
    return !!this.options.ignoreImage
  }

  get ignoreFootnote () {
    return !!this.options.ignoreFootnote
  }

  get ignoreHtml () {
    return !!this.options.ignoreHtml
  }

  public async toDocument(options?: Omit<IPropertiesOptions, 'sections'>) {
    this.footnotes = {}

    const section = await this.toSection()
    
    const doc = new Document({
      numbering,
      styles: createDocumentStyle(),
      ...this.options.document,
      ...options,
      footnotes: this.footnotes,
      sections: [
        {
          children: section,
        }
      ],
    })
    return doc
  }

  public async toSection () {
    const tokenList = tokenize(this.markdown, this.options)

    // parse image
    if (!this.ignoreImage) {
      const imageList = getImageTokens(tokenList)
      if (imageList.length) {
        await this.downloadImageList(imageList)
      }
    }

    return await this.toBlocks(tokenList)
  }

  public async downloadImageList (tokens: Tokens.Image[]) {
    const imageAdapter = this.options.imageAdapter
    if (typeof imageAdapter !== 'function') {
      throw new Error('MarkdownDocx.imageAdapter is not a function')
    }
    const store = this._imageStore
    const promises = tokens.map(async (token) => {
      if (store.has(token.href)) {
        return Promise.resolve(store.get(token.href))
      }

      try {
        const item = await imageAdapter(token)
        if (item) {
          store.set(token.href, item)
          return item
        } else {
          // Mark as failed but don't throw error
          store.set(token.href, null)
          return null
        }
      } catch (error) {
        console.warn(`[MarkdownDocx] Failed to download image: ${token.href}`, error)
        // Mark as failed but don't throw error
        store.set(token.href, null)
        return null
      }
    })
    
    // Use Promise.allSettled instead of Promise.all to handle individual failures
    const results = await Promise.allSettled(promises)
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    )
  }

  public async toBlocks(tokens: IBlockToken[], attr: IBlockAttr = {}): Promise<FileChild[]> {
    return await renderBlocks(this, tokens, attr)
  }

  public toTexts(tokens: IInlineToken[], attr: ITextAttr = {}): ParagraphChild[] {
    return renderTokens(this, tokens, attr)
  }

  public addFootnote(id: number, children: Paragraph[]) {
    this.footnotes[id] = {
      children: children,
    }
  }

  public findImage(token: Tokens.Image): MarkdownImageItem | null {
    const image = this._imageStore.get(token.href)
    if (!image) {
      return null
    }
    return image
  }
}
