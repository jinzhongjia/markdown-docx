import imagesize, { disableTypes, imageSize } from 'image-size'
import { Tokens } from 'marked'
import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'

import { MarkdownImageAdapter } from '../types'
import { getImageExtension, isHttp } from '../utils'

export const downloadImage: MarkdownImageAdapter = async function (token: Tokens.Image) {
  const src = token.href
  if (!src) {
    return null
  }

  try {
    const buffer = await loadImage(src)

    const { width, height, type } = imagesize(buffer)

    const supportType = getImageExtension(src, type)

    if (!supportType) {
      return null
    }

    // @ts-ignore
    if (supportType === 'webp') {
      console.error(`[MarkdownDocx] Webp is not supported in the nodejs environment`)
      return null
    }

    return {
      type: supportType,
      data: buffer,
      width,
      height,
    }
  } catch (error) {
    console.warn(`[MarkdownDocx] Failed to download image from ${src}:`, error instanceof Error ? error.message : error)
    return null
  }
}

function loadImage (src: string) {
  if (isHttp(src)) {
    return new Promise<Buffer>((resolve, reject) => {
      const agent = src.startsWith('https') ? https : http
      const request = agent.get(src, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => {
          chunks.push(chunk)
        })
        res.on('end', () => {
          const buffer = Buffer.concat(chunks)
          disableTypes(['svg', 'webp'])
          resolve(buffer)
        })
        res.on('error', (err) => {
          reject(new Error(`Failed to load image from ${src}: ${err.message || err}`))
        })
      })
      
      // Handle request errors (DNS, connection, etc.)
      request.on('error', (err) => {
        reject(new Error(`Failed to request image from ${src}: ${err.message || err}`))
      })
      
      // Set timeout to prevent hanging
      request.setTimeout(10000, () => {
        request.destroy()
        reject(new Error(`Request timeout for image: ${src}`))
      })
    })
  }
  return fs.readFile(src)
}
