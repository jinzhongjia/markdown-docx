# Markdown to DOCX Web 服务

这是一个基于 Express.js 的 Web 服务，支持将 Markdown 文件转换为 DOCX 格式。服务使用 Node.js 环境进行转换，支持图片下载和语法高亮等功能。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建项目

```bash
pnpm build
```

### 3. 启动服务器

```bash
pnpm server
# 或者
node server.js
```

服务器将在 `http://localhost:3000` 启动。

## 功能特性

- 📄 支持上传 Markdown 文件（.md, .markdown, .txt）
- 🔄 自动转换为 DOCX 格式
- 🖼️ 支持网络图片下载
- 🎨 支持代码语法高亮
- 📱 响应式 Web 界面
- ⚡ 实时转换和下载

## API 接口

### GET /
访问主页，显示文件上传界面

### POST /convert
上传 Markdown 文件并转换为 DOCX

**参数：**
- `markdown`: 上传的 Markdown 文件（multipart/form-data）

**响应：**
- 成功：返回 DOCX 文件下载
- 失败：返回错误信息

### GET /health
健康检查接口

**响应：**
```json
{
  "status": "ok",
  "message": "Markdown to DOCX service is running"
}
```

## 使用方法

1. 在浏览器中打开 `http://localhost:3000`
2. 点击选择 Markdown 文件
3. 点击"转换为 DOCX"按钮
4. 等待转换完成后自动下载 DOCX 文件

## 测试文件

项目中包含一个测试文件 `test-sample.md`，你可以用它来测试转换功能。该文件包含了常见的 Markdown 语法元素。

## 技术栈

- **后端**: Express.js + Multer
- **转换器**: @jinzhongjia/markdown-docx
- **文档生成**: docx.js
- **前端**: 原生 HTML/CSS/JavaScript

## 配置选项

服务器默认配置：
- 端口: 3000
- 文件上传限制: 10MB
- 临时文件目录: uploads/

## 注意事项

1. 服务器会自动清理上传的临时文件
2. 支持的图片格式: PNG, JPEG, GIF, BMP（不支持 WebP）
3. 网络图片会自动下载并嵌入到 DOCX 文件中
4. 转换过程中如果遇到错误，会返回详细的错误信息

## 故障排除

如果遇到问题，请检查：
1. 确保已安装所有依赖
2. 确保已构建项目（运行 `pnpm build`）
3. 检查端口 3000 是否被占用
4. 查看控制台输出的错误信息
