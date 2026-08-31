# markdown-docx

功能强大的 TypeScript 库，高保真地将 Markdown 文件转换为 DOCX 格式，支持浏览器和 Node.js 环境。

[![npm 版本](https://img.shields.io/npm/v/@jinzhongjia/markdown-docx.svg)](https://www.npmjs.com/package/@jinzhongjia/markdown-docx)
[![许可协议](https://img.shields.io/npm/l/@jinzhongjia/markdown-docx.svg)](https://github.com/jinzhongjia/markdown-docx/blob/main/LICENSE)

## 在线演示

[Markdown 转 DOCX 转换器](https://md-docx.vace.me)

## 什么是 markdown-docx？

`markdown-docx` 是一个全面的解决方案，用于将 Markdown 文档转换为 Microsoft Word DOCX 格式，同时保持格式、结构和样式。使用 TypeScript 构建，提供编程 API 和命令行工具，可无缝集成到任何工作流程中。

### 核心能力

- **高保真转换**：保持文档结构、格式和样式
- **通用兼容性**：在浏览器和 Node.js 环境中无缝工作
- **丰富内容支持**：处理图片、表格、代码块、列表、链接和脚注
- **语法高亮**：支持 200+ 种编程语言的高级代码语法高亮
- **可定制样式**：完全控制文档外观和格式
- **图片处理**：自动图片下载和格式转换
- **TypeScript 支持**：完整的类型安全和 IntelliSense 支持

## 功能特性

![截图](./tests/screenshots.png)

- 📝 **高保真转换**：精确保持格式的 Markdown 到 DOCX 转换
- 🎨 **语法高亮**：支持 200+ 种编程语言的高级代码块高亮
- 🖼️ **智能图片处理**：自动图片下载、调整大小和格式转换（包括 WebP）
- 📋 **丰富内容支持**：表格、列表、引用块、标题和任务列表
- 🔗 **高级链接**：超链接、脚注和引用式链接
- 💅 **可定制样式**：完全控制字体、颜色、间距和布局
- 🌐 **跨平台**：在浏览器、Node.js 和命令行工具中工作
- 🖥️ **命令行接口**：用于批量处理和自动化的易用 CLI
- ⚡ **性能优化**：高效处理，支持懒加载和缓存
- 🔧 **可扩展**：支持自定义渲染器和扩展的插件系统

## 安装

```bash
# 使用 npm
npm install @jinzhongjia/markdown-docx

# 使用 yarn
yarn add @jinzhongjia/markdown-docx

# 使用 pnpm
pnpm add @jinzhongjia/markdown-docx
```

## 基础用法

### Node.js

```javascript
import fs from 'node:fs/promises';
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx';

async function convertMarkdownToDocx() {
  // 读取 Markdown 内容
  const markdown = await fs.readFile('input.md', 'utf-8');
  
  // 转换为 DOCX
  const doc = await markdownDocx(markdown);
  
  // 保存文件
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile('output.docx', buffer);
  
  console.log('转换完成！');
}

convertMarkdownToDocx();
```

### 浏览器环境

```javascript
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx';

async function convertMarkdownToDocx(markdownText) {
  // 转换为 DOCX
  const doc = await markdownDocx(markdownText);
  
  // 生成下载文件
  const blob = await Packer.toBlob(doc);
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.docx';
  a.click();
  
  // 清理资源
  URL.revokeObjectURL(url);
}

// 示例：配合文本域使用
document.getElementById('convert-btn').addEventListener('click', () => {
  const markdown = document.getElementById('markdown-input').value;
  convertMarkdownToDocx(markdown);
});
```

## 高级用法

### 使用 MarkdownDocx 类

通过 `MarkdownDocx` 类实现更精细的控制：

```javascript
import { MarkdownDocx, Packer } from '@jinzhongjia/markdown-docx';
import fs from 'node:fs/promises';

async function convertWithOptions() {
  const markdown = await fs.readFile('input.md', 'utf-8');
  
  // 创建带配置的转换器
  const converter = new MarkdownDocx(markdown)
  
  // 生成文档
  const doc = await converter.toDocument({
    title: '我的文档',
    creator: 'markdown-docx',
    description: '由 Markdown 生成'
  });
  
  // 保存文件
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile('output.docx', buffer);
}
```

## API 参考

### 主要函数

#### `markdownDocx(markdown, options?)`

将 Markdown 转换为 DOCX 的主要函数。

```typescript
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx'

const doc = await markdownDocx(markdown, options)
const buffer = await Packer.toBuffer(doc)
```

**参数：**

- `markdown` (string)：要转换的 Markdown 内容
- `options` (MarkdownDocxOptions, 可选)：配置选项

**返回值：** Promise\<Document> - DOCX 文档对象

#### `MarkdownDocx.covert(markdown, options?)`

等同于主函数的静态方法。

```typescript
import { MarkdownDocx } from '@jinzhongjia/markdown-docx'

const doc = await MarkdownDocx.covert(markdown, options)
```

### MarkdownDocx 类

#### 构造函数

```typescript
import { MarkdownDocx } from '@jinzhongjia/markdown-docx'

const converter = new MarkdownDocx(markdown, options)
```

#### 方法

##### `toDocument(documentOptions?)`

将 Markdown 转换为 DOCX 文档。

```typescript
const doc = await converter.toDocument({
  title: '我的文档',
  creator: '您的姓名',
  description: '文档描述',
  subject: '文档主题'
})
```

**参数：**

- `documentOptions` (IPropertiesOptions, 可选)：文档元数据和属性

##### `toSection()`

将 Markdown 转换为文档节（高级用法）。

```typescript
const sections = await converter.toSection()
```

## 配置选项

### MarkdownDocxOptions

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `imageAdapter` | `MarkdownImageAdapter` | 内置适配器 | 自定义图片处理函数 |
| `ignoreImage` | `boolean` | `false` | 跳过图片处理和渲染 |
| `ignoreFootnote` | `boolean` | `false` | 跳过脚注处理和渲染 |
| `ignoreHtml` | `boolean` | `false` | 跳过内联 HTML 处理 |
| `gfm` | `boolean` | `true` | 启用 GitHub 风格 Markdown 支持 |
| `document` | `IPropertiesOptions` | `{}` | 文档元数据和属性 |
| `codeHighlight` | `CodeHighlightOptions` | `{}` | 代码语法高亮配置 |
| `imageSize` | `ImageSizeOptions` | `{}` | 图片尺寸和缩放配置 |

### CodeHighlightOptions

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | 启用/禁用语法高亮 |
| `theme` | `BundledTheme` | `'github-light'` | 语法高亮主题 |
| `languages` | `BundledLanguage[]` | 常用语言 | 支持的编程语言 |
| `showLineNumbers` | `boolean` | `false` | 在代码块中显示行号 |
| `showLanguage` | `boolean` | `false` | 在代码块上方显示语言标签 |
| `autoDetect` | `boolean` | `true` | 自动检测编程语言 |
| `defaultLanguage` | `string` | `'plaintext'` | 未指定代码块的后备语言 |

### ImageSizeOptions

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|-------------|
| `maxWidth` | `number` | `600` | 图片最大宽度（像素） |
| `maxHeight` | `number` | `400` | 图片最大高度（像素） |
| `minWidth` | `number` | `50` | 极小图片的最小宽度 |
| `minHeight` | `number` | `50` | 极小图片的最小高度 |

### 文档属性 (IPropertiesOptions)

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `title` | `string` | 文档标题 |
| `creator` | `string` | 文档作者 |
| `description` | `string` | 文档描述 |
| `subject` | `string` | 文档主题 |
| `keywords` | `string` | 文档关键词 |
| `lastModifiedBy` | `string` | 最后修改者 |
| `company` | `string` | 公司名称 |

同时支持 [marked](https://marked.js.org/using_advanced) 库的额外配置选项。

## 命令行工具

提供 CLI 工具进行文件转换：

```bash
# 全局安装
npm install -g @jinzhongjia/markdown-docx

# 基础用法
markdown-docx --input input.md --output output.docx

# 简写形式
markdown-docx -i input.md -o output.docx
```

未指定输出文件时，默认使用输入文件名并添加 `.docx` 后缀。

## 开发与发布

### 开发脚本

```bash
# 开发模式（热重载）
pnpm run dev

# 构建项目
pnpm run build

# 运行测试（单次运行）
pnpm run test

# 运行测试（监视模式）
pnpm run test:watch

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 转换 markdown 为 DOCX（开发用）
pnpm convert -i input.md -o output.docx
```

### 发布管理

本项目使用 [release-it](https://github.com/release-it/release-it) 进行自动化发布：

```bash
# 测试发布流程（dry-run 模式）
pnpm run release:dry

# 发布（自动选择版本递增）
pnpm run release

# 发布特定版本类型
pnpm run release:patch  # 1.0.0 -> 1.0.1
pnpm run release:minor  # 1.0.0 -> 1.1.0  
pnpm run release:major  # 1.0.0 -> 2.0.0
```

发布流程会自动执行：
- 发布前运行测试
- 构建项目
- 更新 package.json 中的版本号
- 创建 git tag 和 commit
- 发布到 npm
- 创建 GitHub release 和 changelog

## 支持的 Markdown 特性

- 标题（H1-H6）
- 段落与换行
- 强调（粗体、斜体、删除线）
- 列表（有序/无序）
- 链接与图片
- 引用块
- 语法代码块
- 表格
- 水平分隔线
- 脚注
- 任务列表（复选框）

## 高级用法示例

### 代码语法高亮

启用带有自定义主题和选项的高级语法高亮：

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

Shiki 引擎在进程内共享，单次转换无需清理。如果应用需要在不退出进程的情况下卸载转换器，请等待进行中的转换结束后释放共享引擎：

```javascript
import { disposeSharedHighlighter } from '@jinzhongjia/markdown-docx'

await disposeSharedHighlighter()
```

### 自定义文档属性

设置文档元数据和属性：

```javascript
import { MarkdownDocx, Packer } from '@jinzhongjia/markdown-docx'

const converter = new MarkdownDocx(markdown, {
  document: {
    title: '技术文档',
    creator: '开发团队',
    description: 'API 参考指南',
    subject: '软件文档',
    keywords: 'API, REST, 文档',
    company: '您的公司'
  }
})

const doc = await converter.toDocument({
  title: '覆盖标题', // 这将覆盖上面的 document.title
})
```

### 忽略特定元素

跳过处理某些 Markdown 元素：

```javascript
const doc = await markdownDocx(markdown, {
  ignoreImage: true,      // 跳过所有图片
  ignoreFootnote: true,   // 跳过脚注
  ignoreHtml: true,       // 跳过内联 HTML
  gfm: false             // 禁用 GitHub 风格 Markdown
})
```

### 自定义图片大小

控制生成 DOCX 中的图片尺寸：

```javascript
const doc = await markdownDocx(markdown, {
  imageSize: {
    maxWidth: 800,    // 大图片将被缩小
    maxHeight: 600,   // 保持宽高比
    minWidth: 100,    // 极小图片将被放大
    minHeight: 80     // 确保可读性
  }
})
```

### 自定义图片适配器

创建用于专门图片处理的自定义图片适配器：

```typescript
import { MarkdownImageAdapter, MarkdownImageItem } from '@jinzhongjia/markdown-docx'

const customImageAdapter: MarkdownImageAdapter = async (token) => {
  // 自定义图片处理逻辑
  const response = await fetch(token.href)
  const buffer = await response.arrayBuffer()
  
  // 处理图片，调整大小，转换格式等
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

### 批量处理多个文件

在 Node.js 中处理多个 Markdown 文件：

```javascript
import fs from 'node:fs/promises'
import path from 'node:path'
import markdownDocx, { Packer } from '@jinzhongjia/markdown-docx'

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
    
    console.log(`已转换 ${file} -> ${path.basename(outputFile)}`)
  }
}

await batchConvert('./docs', './output')
```

## 图片适配器接口

库为浏览器和 Node.js 环境提供了内置的图片适配器。您可以通过实现 `MarkdownImageAdapter` 接口创建自定义适配器：

```typescript
type MarkdownImageAdapter = (token: Tokens.Image) => Promise<null | MarkdownImageItem>

interface MarkdownImageItem {
  type: 'jpg' | 'png' | 'gif' | 'bmp'
  data: Buffer | string | Uint8Array | ArrayBuffer
  width: number
  height: number
}
```

### 内置功能

- **自动下载** URL 图片
- **格式转换**（浏览器中 WebP 转 PNG）
- **尺寸检测**和优化
- **缓存**避免重复下载
- **错误处理**和优雅降级

## 样式定制

您可以通过修改内置样式来自定义生成的 DOCX 文档外观：

```javascript
import { styles, colors, classes } from '@jinzhongjia/markdown-docx'

// 自定义超链接颜色
styles.default.hyperlink.run.color = '0077cc'

// 自定义代码块样式
styles.markdown.code.run.color = '000000'
styles.markdown.code.run.font = 'Fira Code'

// 自定义标题样式
styles.markdown.heading1.run.size = 40 // 20pt
styles.markdown.heading1.run.color = '2E86AB'

// 自定义引用块样式
styles.markdown.blockquote.run.italics = true
styles.markdown.blockquote.paragraph.border.left.color = 'A23B72'
```

### 可用样式对象

| 样式对象 | 说明 | 文件引用 |
|-------------|-------------|----------------|
| `styles.default` | 默认文档样式（超链接、标题） | [styles.ts](./src/styles/styles.ts) |
| `styles.markdown` | Markdown 特定元素样式 | [markdown.ts](./src/styles/markdown.ts) |
| `styles.colors` | 调色板定义 | [colors.ts](./src/styles/colors.ts) |
| `styles.classes` | CSS 类名映射 | [classes.ts](./src/styles/classes.ts) |

### 自定义样式属性

您可以修改各种样式属性：

```javascript
// 文本格式
styles.markdown.strong.run.bold = true
styles.markdown.em.run.italics = true
styles.markdown.del.run.strike = true

// 间距和布局
styles.markdown.paragraph.paragraph.spacing.before = 200
styles.markdown.paragraph.paragraph.spacing.after = 200

// 边框和背景
styles.markdown.code.paragraph.border.top.color = 'E1E4E8'
styles.markdown.code.paragraph.shading.fill = 'F6F8FA'

// 字体和大小
styles.markdown.code.run.font = 'Consolas'
styles.markdown.code.run.size = 20 // 10pt
```

## 运行环境

库会自动检测运行时环境并相应适配：

### 浏览器运行时

- **图片处理**：使用 Fetch API 下载图片
- **WebP 支持**：使用 Canvas API 自动转换为 PNG
- **包大小**：通过 tree-shaking 优化的浏览器包
- **异步操作**：支持 Web Workers 的非阻塞操作

### Node.js 运行时

- **图片处理**：使用内置 HTTP/HTTPS 模块
- **文件系统**：直接访问本地图片文件
- **性能**：针对服务器端批量处理优化
- **内存管理**：高效的大文件缓冲区处理

### 主要差异

| 功能 | 浏览器 | Node.js |
|---------|---------|---------|
| 图片下载 | Fetch API | HTTP/HTTPS 模块 |
| WebP 支持 | Canvas 转换 | 不支持（记录警告） |
| 本地文件 | 不支持 | 直接文件访问 |
| 包大小 | ~2MB（压缩后） | 完整功能集 |
| 性能 | 受浏览器限制 | 完整系统资源 |

## 示例

更多示例请查看仓库中的 [tests 目录](https://github.com/jinzhongjia/markdown-docx/tree/main/tests)。

## 许可协议

本项目基于 MIT 许可证，详见 LICENSE 文件。

## 相关项目

- [docx](https://github.com/dolanmiu/docx) - DOCX 生成底层库
- [marked](https://github.com/markedjs/marked) - 本项目使用的 Markdown 解析器
