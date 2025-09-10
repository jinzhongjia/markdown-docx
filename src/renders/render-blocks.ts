import { FileChild, Paragraph } from 'docx'
import { Tokens } from 'marked'

import { MarkdownDocx } from '../MarkdownDocx'
import { classes } from '../styles'
import { IBlockAttr, IBlockToken, IInlineToken } from '../types'
import { renderCodeBlock } from './render-code'
import { renderList } from './render-list'
import { renderParagraph } from './render-paragraph'
import { renderTable } from './render-table'

export async function renderBlocks(render: MarkdownDocx, blocks: IBlockToken[], attr: IBlockAttr = {}): Promise<FileChild[]> {
  const paragraphs: FileChild[] = []
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const child = await renderBlock(render, block, attr)
    
    if (Array.isArray(child)) {
      paragraphs.push(...child)
    } else if (child) {
      paragraphs.push(child)
    } else if (child === false) {
      // Block was intentionally skipped (like ignored images)
      continue
    } else if (child == null) {
      console.warn(`Block is empty: ${block.type}`)
    }
  }
  
  // Remove excessive empty paragraphs that can cause blank pages
  return removeExcessiveSpaces(paragraphs)
}

function removeExcessiveSpaces(paragraphs: FileChild[]): FileChild[] {
  const result: FileChild[] = []
  let consecutiveEmptyCount = 0
  
  for (const paragraph of paragraphs) {
    // Check if this is an empty paragraph or space
    const isEmpty = isEmptyParagraph(paragraph)
    
    if (isEmpty) {
      consecutiveEmptyCount++
      // Allow maximum 2 consecutive empty paragraphs
      if (consecutiveEmptyCount <= 2) {
        result.push(paragraph)
      }
    } else {
      consecutiveEmptyCount = 0
      result.push(paragraph)
    }
  }
  
  return result
}

function isEmptyParagraph(element: FileChild): boolean {
  // Check if element is a Paragraph with empty or whitespace-only text
  if (element && typeof element === 'object' && 'constructor' in element) {
    const constructor = element.constructor
    if (constructor && constructor.name === 'Paragraph') {
      // This is a basic check - in practice, we might need more sophisticated detection
      // For now, we'll be conservative and only filter obvious space elements
      return false
    }
  }
  return false
}

async function renderBlock(render: MarkdownDocx, block: IBlockToken, attr: IBlockAttr): Promise<FileChild | FileChild[] | false | null> {
  switch (block.type) {
    case 'space':
      // Reduce excessive spaces to prevent blank pages
      return new Paragraph({
        text: '',
        style: classes.Space,
        spacing: {
          before: 0,
          after: 60, // Reduced from default spacing
        },
      })
    case 'code':
      return await renderCodeBlock(render, block as Tokens.Code, attr)
    case 'heading':
      return renderParagraph(render, block.tokens as IInlineToken[], {
        ...attr,
        heading: block.depth,
        // @ts-ignore
        style: classes[`Heading${block.depth}`],
      })
    case 'hr':
      return new Paragraph({
        text: '',
        thematicBreak: true,
        style: classes.Hr,
      })
    case 'blockquote':
      return await renderBlocks(render, block.tokens as IBlockToken[], {
        ...attr,
        blockquote: true,
        style: classes.Blockquote,
      })
    case 'list':
      return await renderList(render, block, attr)
    case 'html':
      if (render.ignoreHtml) {
        return false
      }
      return renderParagraph(render, block.text, {
        ...attr,
        code: true,
        style: classes.Html,
      })
    case 'def':
      // TODO: handle def
      return new Paragraph({
        text: block.title,
        style: classes.Def,
      })
    case 'table':
      return renderTable(render, block as Tokens.Table, attr)
    case 'paragraph':
      return renderParagraph(render, block.tokens as IInlineToken[], {
        style: classes.Paragraph, // can be overridden by attr
        ...attr,
      })
    case 'text':
      if (block.tokens?.length) {
        return renderParagraph(render, block.tokens as IInlineToken[], {
          style: classes.Text,  // can be overridden by attr
          ...attr,
        })
      }
      return renderParagraph(render, block.text, attr)
    case 'footnote':
      const noteList = await renderBlocks(render, block.tokens as IBlockToken[], {
        ...attr,
        style: classes.Footnote,
        footnote: true,
      })
      render.addFootnote(block.id, noteList as Paragraph[])
      return false
    default:
      return null
  }
}
