# markdown-docx

A powerful TypeScript library that converts Markdown files to DOCX format with high fidelity, supporting both browser and Node.js environments.

功能强大的 TypeScript 库，高保真地将 Markdown 文件转换为 DOCX 格式，支持浏览器和 Node.js 环境。

[![npm version](https://img.shields.io/npm/v/@jinzhongjia/markdown-docx.svg)](https://www.npmjs.com/package/@jinzhongjia/markdown-docx)
[![License](https://img.shields.io/npm/l/@jinzhongjia/markdown-docx.svg)](https://github.com/jinzhongjia/markdown-docx/blob/main/LICENSE)

## Online Demo

[Markdown to DOCX Converter](https://md-docx.vace.me)

## What is markdown-docx?

`markdown-docx` is a comprehensive solution for converting Markdown documents into Microsoft Word DOCX format while preserving formatting, structure, and styling. Built with TypeScript, it offers both programmatic APIs and command-line tools for seamless integration into any workflow.

### Key Capabilities

- **High-Fidelity Conversion**: Maintains document structure, formatting, and styling
- **Universal Compatibility**: Works seamlessly in browsers and Node.js environments
- **Rich Content Support**: Handles images, tables, code blocks, lists, links, and footnotes
- **Syntax Highlighting**: Advanced code syntax highlighting with 200+ language support
- **Customizable Styling**: Full control over document appearance and formatting
- **Image Processing**: Automatic image downloading and format conversion
- **TypeScript Support**: Full type safety and IntelliSense support

## Features

![Screenshot](./tests/screenshots.png)

- 📝 **High-Fidelity Conversion**: Convert Markdown to DOCX with precise formatting preservation
- 🎨 **Syntax Highlighting**: Advanced code block highlighting with 200+ programming languages
- 🖼️ **Smart Image Handling**: Automatic image downloading, resizing, and format conversion (including WebP)
- 📋 **Rich Content Support**: Tables, lists, blockquotes, headings, and task lists
- 🔗 **Advanced Linking**: Hyperlinks, footnotes, and reference-style links
- 💅 **Customizable Styling**: Complete control over fonts, colors, spacing, and layout
- 🌐 **Cross-Platform**: Works in browsers, Node.js, and as a CLI tool
- 🖥️ **Command-Line Interface**: Easy-to-use CLI for batch processing and automation
- ⚡ **Performance Optimized**: Efficient processing with lazy loading and caching
- 🔧 **Extensible**: Plugin system for custom renderers and extensions

## Installation

```bash
# Using npm
npm install @jinzhongjia/markdown-docx

# Using yarn
yarn add @jinzhongjia/markdown-docx

# Using pnpm
pnpm add @jinzhongjia/markdown-docx
```

## Basic Usage

### Node.js

```javascript
import fs from 'node:fs/promises';
import markdownDocx, { Packer } from 'markdown-docx';

async function convertMarkdownToDocx() {
  // Read markdown content
  const markdown = await fs.readFile('input.md', 'utf-8');
  
  // Convert to docx
  const doc = await markdownDocx(markdown);
  
  // Save to file
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile('output.docx', buffer);
  
  console.log('Conversion completed successfully!');
}

convertMarkdownToDocx();
```

### Browser

```javascript
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx';

async function convertMarkdownToDocx(markdownText) {
  // Convert to docx
  const doc = await markdownDocx(markdownText);
  
  // Generate blob for download
  const blob = await Packer.toBlob(doc);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.docx';
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}

// Example usage with a textarea
document.getElementById('convert-btn').addEventListener('click', () => {
  const markdown = document.getElementById('markdown-input').value;
  convertMarkdownToDocx(markdown);
});
```

## Advanced Usage

### Using the MarkdownDocx Class

For more control over the conversion process, you can use the `MarkdownDocx` class directly:

```javascript
import { MarkdownDocx, Packer } from '@jinzhongjia/markdown-docx';
import fs from 'node:fs/promises';

async function convertWithOptions() {
  const markdown = await fs.readFile('input.md', 'utf-8');
  
  // Create instance with options
  const converter = new MarkdownDocx(markdown)
  
  // Generate document
  const doc = await converter.toDocument({
    title: 'My Document',
    creator: 'markdown-docx',
    description: 'Generated from Markdown'
  });
  
  // Save to file
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile('output.docx', buffer);
}
```

## API Reference

### Main Functions

#### `markdownDocx(markdown, options?)`

The primary function to convert Markdown to DOCX.

```typescript
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx'

const doc = await markdownDocx(markdown, options)
const buffer = await Packer.toBuffer(doc)
```

**Parameters:**

- `markdown` (string): The Markdown content to convert
- `options` (MarkdownDocxOptions, optional): Configuration options

**Returns:** Promise\<Document> - A DOCX document object

#### `MarkdownDocx.covert(markdown, options?)`

Static method equivalent to the main function.

```typescript
import { MarkdownDocx } from '@jinzhongjia/markdown-docx'

const doc = await MarkdownDocx.covert(markdown, options)
```

### MarkdownDocx Class

#### Constructor

```typescript
import { MarkdownDocx } from '@jinzhongjia/markdown-docx'

const converter = new MarkdownDocx(markdown, options)
```

#### Methods

##### `toDocument(documentOptions?)`

Converts the Markdown to a DOCX document.

```typescript
const doc = await converter.toDocument({
  title: 'My Document',
  creator: 'Your Name',
  description: 'Document description',
  subject: 'Document subject'
})
```

**Parameters:**

- `documentOptions` (IPropertiesOptions, optional): Document metadata and properties

##### `toSection()`

Converts Markdown to document sections (advanced usage).

```typescript
const sections = await converter.toSection()
```

## Configuration Options

### MarkdownDocxOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `imageAdapter` | `MarkdownImageAdapter` | Built-in adapter | Custom function to handle image processing |
| `ignoreImage` | `boolean` | `false` | Skip image processing and rendering |
| `ignoreFootnote` | `boolean` | `false` | Skip footnote processing and rendering |
| `ignoreHtml` | `boolean` | `false` | Skip inline HTML processing |
| `gfm` | `boolean` | `true` | Enable GitHub Flavored Markdown support |
| `document` | `IPropertiesOptions` | `{}` | Document metadata and properties |
| `codeHighlight` | `CodeHighlightOptions` | `{}` | Code syntax highlighting configuration |
| `imageSize` | `ImageSizeOptions` | `{}` | Image sizing and scaling configuration |

### CodeHighlightOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable syntax highlighting |
| `theme` | `BundledTheme` | `'github-light'` | Syntax highlighting theme |
| `languages` | `BundledLanguage[]` | Common languages | Supported programming languages |
| `showLineNumbers` | `boolean` | `false` | Display line numbers in code blocks |
| `showLanguage` | `boolean` | `false` | Display language label above code blocks |
| `autoDetect` | `boolean` | `true` | Automatically detect programming language |
| `defaultLanguage` | `string` | `'plaintext'` | Fallback language for unspecified code blocks |

### ImageSizeOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxWidth` | `number` | `600` | Maximum width for images in pixels |
| `maxHeight` | `number` | `400` | Maximum height for images in pixels |
| `minWidth` | `number` | `50` | Minimum width for very small images |
| `minHeight` | `number` | `50` | Minimum height for very small images |

### Document Properties (IPropertiesOptions)

| Option | Type | Description |
|--------|------|-------------|
| `title` | `string` | Document title |
| `creator` | `string` | Document author |
| `description` | `string` | Document description |
| `subject` | `string` | Document subject |
| `keywords` | `string` | Document keywords |
| `lastModifiedBy` | `string` | Last modified by |
| `company` | `string` | Company name |

Additional options from the [marked](https://marked.js.org/using_advanced) library are also supported.

## Command Line Interface

markdown-docx includes a CLI tool for converting markdown files from the command line:

```bash
# Install globally
npm install -g @jinzhongjia/markdown-docx

# Basic usage
markdown-docx --input input.md --output output.docx

# Short form
markdown-docx -i input.md -o output.docx
```

If the output file is not specified, it will use the input filename with a `.docx` extension.

## Development & Release

### Development Scripts

```bash
# Development mode with hot reload
pnpm run dev

# Build the project
pnpm run build

# Run tests (single run)
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Convert markdown to DOCX (development)
pnpm convert -i input.md -o output.docx
```

### Release Management

This project uses [release-it](https://github.com/release-it/release-it) for automated releases:

```bash
# Test release process (dry-run)
pnpm run release:dry

# Release with automatic version increment
pnpm run release

# Release specific version types
pnpm run release:patch  # 1.0.0 -> 1.0.1
pnpm run release:minor  # 1.0.0 -> 1.1.0  
pnpm run release:major  # 1.0.0 -> 2.0.0
```

The release process automatically:
- Runs tests before release
- Builds the project
- Updates version in package.json
- Creates git tag and commit
- Publishes to npm
- Creates GitHub release with changelog

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs and line breaks
- Emphasis (bold, italic, strikethrough)
- Lists (ordered and unordered)
- Links and images
- Blockquotes
- Code blocks
- Tables
- Horizontal rules
- Footnotes
- Task lists (checkboxes)

## Advanced Usage Examples

### Code Syntax Highlighting

Enable advanced syntax highlighting with custom themes and options:

```javascript
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx'

const doc = await markdownDocx(markdown, {
  codeHighlight: {
    enabled: true,
    theme: 'github-dark',
    showLineNumbers: true,
    showLanguage: true,
    languages: ['javascript', 'typescript', 'python', 'java'],
    defaultLanguage: 'javascript'
  }
})

const buffer = await Packer.toBuffer(doc)
```

### Custom Document Properties

Set document metadata and properties:

```javascript
import { MarkdownDocx, Packer } from '@jinzhongjia/markdown-docx'

const converter = new MarkdownDocx(markdown, {
  document: {
    title: 'Technical Documentation',
    creator: 'Development Team',
    description: 'API Reference Guide',
    subject: 'Software Documentation',
    keywords: 'API, REST, Documentation',
    company: 'Your Company'
  }
})

const doc = await converter.toDocument({
  title: 'Override Title', // This will override the document.title above
})
```

### Ignoring Specific Elements

Skip processing certain Markdown elements:

```javascript
const doc = await markdownDocx(markdown, {
  ignoreImage: true,      // Skip all images
  ignoreFootnote: true,   // Skip footnotes
  ignoreHtml: true,       // Skip inline HTML
  gfm: false             // Disable GitHub Flavored Markdown
})
```

### Custom Image Sizing

Control image dimensions in the generated DOCX:

```javascript
const doc = await markdownDocx(markdown, {
  imageSize: {
    maxWidth: 800,    // Larger images will be scaled down
    maxHeight: 600,   // Maintain aspect ratio
    minWidth: 100,    // Very small images will be scaled up
    minHeight: 80     // Ensure readability
  }
})
```

### Custom Image Adapter

Create a custom image adapter for specialized image processing:

```typescript
import { MarkdownImageAdapter, MarkdownImageItem } from '@jinzhongjia/markdown-docx'

const customImageAdapter: MarkdownImageAdapter = async (token) => {
  // Custom image processing logic
  const response = await fetch(token.href)
  const buffer = await response.arrayBuffer()
  
  // Process image, resize, convert format, etc.
  const processedImage = await processImage(buffer)
  
  return {
    type: 'png',
    data: processedImage,
    width: 800,
    height: 600
  }
}

const doc = await markdownDocx(markdown, {
  imageAdapter: customImageAdapter
})
```

### Batch Processing Multiple Files

Process multiple Markdown files in Node.js:

```javascript
import fs from 'node:fs/promises'
import path from 'node:path'
import markdownDocx, { Packer } from 'markdown-docx'

async function batchConvert(inputDir, outputDir) {
  const files = await fs.readdir(inputDir)
  const markdownFiles = files.filter(file => file.endsWith('.md'))
  
  for (const file of markdownFiles) {
    const markdown = await fs.readFile(path.join(inputDir, file), 'utf-8')
    const doc = await markdownDocx(markdown, {
      codeHighlight: { enabled: true, theme: 'github-light' }
    })
    
    const buffer = await Packer.toBuffer(doc)
    const outputFile = path.join(outputDir, file.replace('.md', '.docx'))
    await fs.writeFile(outputFile, buffer)
    
    console.log(`Converted ${file} -> ${path.basename(outputFile)}`)
  }
}

await batchConvert('./docs', './output')
```

## Image Adapter Interface

The library provides built-in image adapters for both browser and Node.js environments. You can create custom adapters by implementing the `MarkdownImageAdapter` interface:

```typescript
type MarkdownImageAdapter = (token: Tokens.Image) => Promise<null | MarkdownImageItem>

interface MarkdownImageItem {
  type: 'jpg' | 'png' | 'gif' | 'bmp'
  data: Buffer | string | Uint8Array | ArrayBuffer
  width: number
  height: number
}
```

### Built-in Features

- **Automatic downloading** of images from URLs
- **Format conversion** (WebP to PNG in browsers)
- **Size detection** and optimization
- **Caching** to avoid duplicate downloads
- **Error handling** with graceful fallbacks

## Style Customization

You can customize the appearance of generated DOCX documents by modifying the built-in styles:

```javascript
import { styles, colors, classes } from '@jinzhongjia/markdown-docx'

// Customize hyperlink color
styles.default.hyperlink.run.color = '0077cc'

// Customize code block styling
styles.markdown.code.run.color = '000000'
styles.markdown.code.run.font = 'Fira Code'

// Customize heading styles
styles.markdown.heading1.run.size = 40 // 20pt
styles.markdown.heading1.run.color = '2E86AB'

// Customize blockquote styling
styles.markdown.blockquote.run.italics = true
styles.markdown.blockquote.paragraph.border.left.color = 'A23B72'
```

### Available Style Objects

| Style Object | Description | File Reference |
|-------------|-------------|----------------|
| `styles.default` | Default document styles (hyperlinks, headings) | [styles.ts](./src/styles/styles.ts) |
| `styles.markdown` | Markdown-specific element styles | [markdown.ts](./src/styles/markdown.ts) |
| `styles.colors` | Color palette definitions | [colors.ts](./src/styles/colors.ts) |
| `styles.classes` | CSS class name mappings | [classes.ts](./src/styles/classes.ts) |

### Custom Style Properties

You can modify various style properties:

```javascript
// Text formatting
styles.markdown.strong.run.bold = true
styles.markdown.em.run.italics = true
styles.markdown.del.run.strike = true

// Spacing and layout
styles.markdown.paragraph.paragraph.spacing.before = 200
styles.markdown.paragraph.paragraph.spacing.after = 200

// Borders and backgrounds
styles.markdown.code.paragraph.border.top.color = 'E1E4E8'
styles.markdown.code.paragraph.shading.fill = 'F6F8FA'

// Font and size
styles.markdown.code.run.font = 'Consolas'
styles.markdown.code.run.size = 20 // 10pt
```

## Environment Compatibility

The library automatically detects the runtime environment and adapts accordingly:

### Browser Environment

- **Image Processing**: Uses Fetch API for downloading images
- **WebP Support**: Automatic conversion to PNG using Canvas API
- **Bundle Size**: Optimized browser bundle with tree-shaking
- **Async Operations**: Non-blocking with Web Workers support

### Node.js Environment

- **Image Processing**: Uses built-in HTTP/HTTPS modules
- **File System**: Direct file system access for local images
- **Performance**: Optimized for server-side batch processing
- **Memory Management**: Efficient buffer handling for large files

### Key Differences

| Feature | Browser | Node.js |
|---------|---------|---------|
| Image Download | Fetch API | HTTP/HTTPS modules |
| WebP Support | Canvas conversion | Not supported (logs warning) |
| Local Files | Not supported | Direct file access |
| Bundle Size | ~2MB (minified) | Full feature set |
| Performance | Limited by browser | Full system resources |

## Examples

For more examples, see the [tests directory](https://github.com/jinzhongjia/markdown-docx/tree/main/tests) in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [docx](https://github.com/dolanmiu/docx) - The underlying library for creating DOCX files
- [marked](https://github.com/markedjs/marked) - The Markdown parser used in this project
