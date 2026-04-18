# AI 工作复盘助手

Web + 浏览器插件的全栈 AI 工作复盘助手。通过碎片化录入、结构化提取、一键生成汇报/简历模式，帮助职场人高效沉淀工作资产。

---

## 核心功能

1. **项目 / 标签管理**：在 Web 端创建项目并设定核心目标，作为碎片归类的锚点。
2. **碎片化捕获**：通过浏览器插件随时记录语音/文字碎片，AI 自动提取关键业务事实。
3. **结构化复盘**：在 Web 端勾选相关碎片，一键生成「汇报模式」和「简历模式」双视角文档。
4. **深色模式与玻璃拟态 UI**：统一的现代视觉风格，支持浅色/深色主题切换。

---

## 技术栈

| 端 | 技术 |
|---|---|
| 后端 | Python 3.11+、FastAPI、SQLAlchemy 2.0 (async)、PostgreSQL、Anthropic SDK |
| Web | Next.js 14 (App Router)、React、TypeScript、Tailwind CSS |
| 插件 | Plasmo Framework、React、Chrome Extension MV3 |

---

## 目录结构

```
backend/          FastAPI 后端
  app/
    core/         配置 (Pydantic Settings)
    db/           异步引擎、Session、Base
    models/       SQLAlchemy ORM 模型
    schemas/      Pydantic 请求/响应模型
    crud/         数据库操作
    routers/      API 路由
    services/     业务逻辑与 LLM 调用
  tests/          pytest 测试
  alembic/        数据库迁移

web/              Next.js Web 主平台
  app/            页面与组件
  lib/            API 封装与工具
  public/         静态资源

extension/        Plasmo 浏览器插件
  popup.tsx       插件弹窗主入口
  api.ts          插件端 API 封装
  offscreen.tsx   语音输入 Offscreen 载体
  assets/         插件图标等资源
```

---

## 本地开发

### 1. 克隆与准备

```bash
git clone <repo-url>
cd AI工作复盘产品
```

### 2. 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

复制环境变量模板并填写：

```bash
cp .env.example .env
```

关键变量：

- `DATABASE_URL`：PostgreSQL 连接字符串（开发用本地，生产用 Render/Railway 等）
- `ANTHROPIC_API_KEY`：Anthropic API Key（用于 Kimi coding 代理时请填写 Kimi Key）
- `ANTHROPIC_BASE_URL`：`https://api.kimi.com/coding/`（如使用 Kimi coding 代理）或留空使用官方地址
- `APP_ENV`：`development`（开发环境 AI 调用失败时会降级返回 mock 内容，方便联调）

数据库迁移（首次运行前必须执行）：

```bash
alembic upgrade head
```

启动服务：

```bash
python -m uvicorn app.main:app --reload --port 8001
```

> 若 Windows 上 8001 端口被占用，可临时改用 `--port 8002`，并同步修改 Web/插件的 API 地址。

Swagger 文档：`http://localhost:8001/docs`

### 3. Web 前端

```bash
cd web
npm install
npm run dev
```

默认运行在 `http://localhost:3000`。

### 4. 浏览器插件

```bash
cd extension
npm install
npm run build
```

构建产物位于 `extension/build/chrome-mv3-dev/`。打开 Chrome 的「扩展程序 -> 开发者模式 -> 加载已解压的扩展程序」，选择该目录即可加载插件。

---

## 部署指南

### 后端（Render）

1. 在 Render 创建 Web Service，选择 Python 环境。
2. 根目录指向 `backend/`。
3. 在仓库根目录放置 `runtime.txt`，内容：`python-3.11.9`（避免 Render 默认 3.14 导致依赖编译失败）。
4. 启动命令：
   ```bash
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```
5. 在环境变量中填入 `DATABASE_URL`、`ANTHROPIC_API_KEY`、`ANTHROPIC_BASE_URL`、`APP_ENV=production`、`CORS_ORIGINS`（包含你的 Web 域名和 `chrome-extension://*`）。
6. 如果使用 Render 自带 PostgreSQL，其证书为自签名，后端代码已自动处理 SSL 跳过校验，无需额外配置。
7. 部署完成后，访问 `https://<your-backend>/docs` 确认 API 正常。

### Web 前端（Vercel）

1. 在 Vercel 导入项目，根目录选择 `web/`。
2. 在 `web/` 目录下创建 `vercel.json`，内容：`{"framework": "nextjs"}`（避免 Vercel 未自动识别框架）。
3. 框架预设选择 Next.js。
4. 添加环境变量 `NEXT_PUBLIC_API_URL=https://<your-backend>`。
5. 部署。
6. 部署后记得将 Render 后端的 `CORS_ORIGINS` 更新为 Vercel 的真实域名（如 `https://ai-work-review-zeta.vercel.app`），然后重新部署后端。

### 浏览器插件（本地自用，免上架）

如果只是自己使用，**无需支付 $5 注册费，无需截图和隐私政策，无需等待审核**。

1. 确保 `extension/api.ts` 中的 `BASE_URL` 指向生产后端地址。
2. 运行 `cd extension && npm run build` 生成生产包。
3. 打开 `chrome://extensions/`，开启右上角**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择 `extension/build/chrome-mv3-prod/` 文件夹。
5. 插件图标出现在浏览器右上角，点击即可使用。
6. 后续更新代码后，重新构建并点击插件卡片上的 **刷新按钮** 即可。

---

## 环境变量参考

### 后端 `.env`

```env
# AI 引擎（Anthropic SDK，兼容 Kimi coding 代理）
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxx
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620

# 备选：原生 Kimi API（OpenAI 兼容）
KIMI_API_KEY=
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# App
APP_ENV=production
CORS_ORIGINS=https://your-web.vercel.app,chrome-extension://*
```

### Web `.env.local`

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 开发注意事项

- **语音输入**：插件 popup 通过 Chrome Offscreen API 承载 `webkitSpeechRecognition` 实现语音转文字。首次使用需授权麦克风权限。
- **AI 降级策略**：当 `APP_ENV=development` 且 LLM 调用失败时，`/projects/{id}/generate` 会返回模拟复盘内容，便于前端 UI 联调。生产环境请务必配置有效的 API Key。
- **数据库迁移**：项目使用 Alembic 管理数据库版本。本地开发或生产部署后，首次运行前请执行 `alembic upgrade head`。

---

## License

MIT
