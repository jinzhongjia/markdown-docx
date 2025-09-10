import { ImageRun } from 'docx'
import { Tokens } from 'marked'

import { MarkdownDocx } from '../MarkdownDocx'
import { ITextAttr } from '../types'
import { renderText } from './render-text'

export function renderImage(render: MarkdownDocx, block: Tokens.Image, attr: ITextAttr) {
  if (render.ignoreImage) {
    return false
  }

  const image = render.findImage(block)

  // If image download failed or image is not available, render as text with fallback
  if (!image || !image.type || !image.data) {
    // Provide a more descriptive fallback text
    const fallbackText = image === null 
      ? `[Image failed to load: ${block.text || 'image'}]` 
      : `[Image: ${block.text || 'image'}](${block.href})`
    
    return renderText(render, fallbackText, {
      ...attr,
      // Add some styling to indicate this is a failed image
      em: true
    })
  }

  try {
    return new ImageRun({
      type: image.type,
      data: image.data,
      transformation: {
        width: image.width,
        height: image.height,
      },
      altText: {
        title: block.title || block.text,
        description: block.text,
        name: block.text
      }
    })
  } catch (error) {
    // If ImageRun creation fails, fall back to text
    console.warn(`[MarkdownDocx] Failed to create ImageRun for ${block.href}:`, error)
    return renderText(render, `[Image render failed: ${block.text || 'image'}]`, {
      ...attr,
      em: true
    })
  }
}
