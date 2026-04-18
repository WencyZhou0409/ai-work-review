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
| 后端 | Python 3.11+、FastAPI、SQLAlchemy 2.0 (async)、PostgreSQL (Supabase)、Kimi API |
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

- `DATABASE_URL`：PostgreSQL 连接字符串（推荐 Supabase）
- `KIMI_API_KEY`：Moonshot AI API Key
- `KIMI_BASE_URL`：`https://api.moonshot.cn/v1`
- `APP_ENV`：`development`（开发环境 AI 调用失败时会降级返回 mock 内容，方便联调）

启动服务：

```bash
python -m uvicorn app.main:app --reload --port 8001
```

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

### 后端（Render / Railway）

1. 在 Render 或 Railway 创建 Web Service，选择 Python 环境。
2. 根目录指向 `backend/`。
3. 启动命令：`python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. 在环境变量中填入 `DATABASE_URL`、`KIMI_API_KEY`、`KIMI_BASE_URL`、`CORS_ORIGINS`（包含你的 Web 域名和 `chrome-extension://*`）。
5. 部署完成后，访问 `https://<your-backend>/docs` 确认 API 正常。

### Web 前端（Vercel）

1. 在 Vercel 导入项目，根目录选择 `web/`。
2. 框架预设选择 Next.js。
3. 添加环境变量 `NEXT_PUBLIC_API_URL=https://<your-backend>`。
4. 部署。

### 浏览器插件分发

1. 运行 `cd extension && npm run build` 生成生产包。
2. 将 `build/chrome-mv3-prod/` 目录打包为 `.zip`。
3. 登录 [Chrome Web Store 开发者后台](https://chrome.google.com/webstore/devconsole/) 上传并发布。
4. 发布前请修改 `package.json` 中的 `name`、`version` 和 `description`，并在 `assets/` 中放置合规的插件图标。

---

## 环境变量参考

### 后端 `.env`

```env
# Kimi API
KIMI_API_KEY=sk-xxxxxxxxxxxxxxxx
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2.5

# Database (Supabase / PostgreSQL)
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

- **语音输入**：由于 Chrome 扩展 popup 的安全限制，`webkitSpeechRecognition` 无法在 popup 中直接运行。当前版本在插件端点击麦克风时会提示"暂不支持语音输入，请手动输入"。后续如需完整语音功能，可通过 Offscreen API 或 content script 实现。
- **AI 降级策略**：当 `APP_ENV=development` 且 Kimi API 调用失败时，`/projects/{id}/generate` 会返回模拟复盘内容，便于前端 UI 联调。生产环境请务必配置有效的 `KIMI_API_KEY`。
- **数据库迁移**：项目使用 SQLAlchemy `create_all` 在启动时自动建表。生产环境建议配合 Alembic 做版本化迁移。

---

## License

MIT
