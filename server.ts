import express from 'express'
import multer from 'multer'
import { Packer } from 'docx'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import markdownDocx from './dist/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3000

// 配置 multer 用于文件上传
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')))

// 首页 - 显示上传表单
app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown 转 DOCX 服务</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 30px;
            }
            .upload-area {
                border: 2px dashed #ddd;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
                margin-bottom: 20px;
                transition: border-color 0.3s;
            }
            .upload-area:hover {
                border-color: #007acc;
            }
            input[type="file"] {
                margin: 20px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                width: 100%;
            }
            button {
                background: #007acc;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                width: 100%;
                transition: background-color 0.3s;
            }
            button:hover {
                background: #005a9e;
            }
            button:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
                display: none;
            }
            .result.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .result.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .loading {
                text-align: center;
                color: #666;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📄 Markdown 转 DOCX 服务 (TypeScript)</h1>
            <form id="uploadForm" enctype="multipart/form-data">
                <div class="upload-area">
                    <p>选择 Markdown 文件上传</p>
                    <input type="file" id="markdownFile" name="markdown" accept=".md,.markdown,.txt" required>
                </div>
                <button type="submit" id="convertBtn">转换为 DOCX</button>
            </form>
            <div id="result" class="result"></div>
        </div>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                
                const formData = new FormData()
                const fileInput = document.getElementById('markdownFile')
                const file = fileInput.files[0]
                
                if (!file) {
                    showResult('请选择一个 Markdown 文件', 'error')
                    return
                }
                
                formData.append('markdown', file)
                
                const convertBtn = document.getElementById('convertBtn')
                const result = document.getElementById('result')
                
                convertBtn.disabled = true
                convertBtn.textContent = '转换中...'
                result.style.display = 'none'
                
                try {
                    const response = await fetch('/convert', {
                        method: 'POST',
                        body: formData
                    })
                    
                    if (response.ok) {
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = file.name.replace(/\\.(md|markdown|txt)$/i, '.docx')
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        
                        showResult('转换成功！文件已开始下载', 'success')
                    } else {
                        const errorText = await response.text()
                        showResult('转换失败: ' + errorText, 'error')
                    }
                } catch (error) {
                    showResult('网络错误: ' + error.message, 'error')
                } finally {
                    convertBtn.disabled = false
                    convertBtn.textContent = '转换为 DOCX'
                }
            })
            
            function showResult(message, type) {
                const result = document.getElementById('result')
                result.textContent = message
                result.className = 'result ' + type
                result.style.display = 'block'
            }
        </script>
    </body>
    </html>
  `)
})

// 文件转换接口
app.post('/convert', upload.single('markdown'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).send('未找到上传的文件')
    }

    console.log(`📄 开始转换文件: ${req.file.originalname}`)

    // 读取上传的 markdown 文件
    const markdownContent = await fs.readFile(req.file.path, 'utf-8')
    
    // 使用 nodejs 适配器转换 (默认已配置)
    const doc = await markdownDocx(markdownContent)
    
    // 生成 docx 文件
    const buffer = await Packer.toBuffer(doc)
    
    // 清理临时文件
    await fs.unlink(req.file.path).catch(() => {})
    
    console.log(`✅ 转换完成: ${req.file.originalname} -> ${req.file.originalname.replace(/\.(md|markdown|txt)$/i, '.docx')}`)
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace(/\.(md|markdown|txt)$/i, '.docx')}"`)
    
    // 发送文件
    res.send(buffer)
    
  } catch (error) {
    console.error('❌ 转换错误:', error)
    
    // 清理临时文件
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {})
    }
    
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    res.status(500).send('转换失败: ' + errorMessage)
  }
})

// 健康检查接口
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Markdown to DOCX service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 Markdown to DOCX 服务已启动 (TypeScript)`)
  console.log(`📍 访问地址: http://localhost:${port}`)
  console.log(`📋 健康检查: http://localhost:${port}/health`)
  console.log(`🔧 开发模式: TypeScript + tsx`)
})

// 错误处理
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 服务器错误:', error)
  res.status(500).send('服务器内部错误: ' + error.message)
})

// 确保 uploads 目录存在
try {
  await fs.mkdir('uploads', { recursive: true })
  console.log('📁 uploads 目录已准备就绪')
} catch (error) {
  console.warn('⚠️  创建 uploads 目录失败:', error instanceof Error ? error.message : error)
}
