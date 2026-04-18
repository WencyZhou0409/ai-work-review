# AI 工作复盘助手 —— 生产部署指南

## 部署架构概览

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Chrome 插件  │ ──→ │   Next.js Web   │ ←──→ │  FastAPI 后端   │
│  (Plasmo)    │      │   (Vercel)      │      │  (Render/Railway)│
└─────────────┘      └─────────────────┘      └─────────────────┘
                                                        │
                                                        ↓
                                                ┌─────────────┐
                                                │  Supabase   │
                                                │ PostgreSQL  │
                                                └─────────────┘
```

---

## 一、后端部署（Render / Railway）

### 1.1 准备工作

你需要：
- **Supabase 项目**（免费版够用）
- **Render 账号** 或 **Railway 账号**
- **Anthropic API Key**（通过 Kimi coding proxy）

### 1.2 环境变量

在 Render / Railway 的 Environment 中配置以下变量：

```env
APP_ENV=production
DATABASE_URL=postgresql+asyncpg://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-...
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
```

> **注意**：Supabase 的连接字符串密码如果含特殊字符（如 `%`），需要 URL encode。

### 1.3 Render 部署步骤

1. 在 Render 点击 **New + → Web Service**
2. 连接你的 GitHub 仓库，选择 `backend/` 作为 Root Directory
3. 配置：
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
4. 填入上面的环境变量
5. 点击 Deploy

### 1.4 Railway 部署步骤

1. 在 Railway 新建项目 → 从 GitHub 部署
2. 设置 Root Directory 为 `backend/`
3. Railway 会自动识别 Python 项目并安装依赖
4. 在 Settings → Deploy 中添加自定义启动命令：
   ```bash
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```
5. 填入环境变量，重新部署

### 1.5 数据库迁移

服务首次部署成功后，在本地或有 Python 环境的地方执行 Alembic 迁移：

```bash
cd backend
alembic upgrade head
```

或者把迁移写进启动脚本（不推荐，容易并发问题），建议手动执行一次即可。

### 1.6 验证后端

访问 `https://你的后端域名/docs`，确认 Swagger 文档正常打开。
测试：
```bash
curl https://你的后端域名/projects
```

---

## 二、Web 前端部署（Vercel）

### 2.1 准备工作
- Vercel 账号
- 后端已部署并能公网访问

### 2.2 环境变量

在 Vercel Project Settings → Environment Variables 中添加：

```env
NEXT_PUBLIC_API_BASE_URL=https://你的后端域名
```

### 2.3 Vercel 部署步骤

1. 在 Vercel 导入 GitHub 仓库
2. 设置 **Root Directory** 为 `web/`
3. Framework Preset 选择 **Next.js**
4. Build Command 保持默认（`next build`）
5. 添加环境变量 `NEXT_PUBLIC_API_BASE_URL`
6. 点击 Deploy

### 2.4 CORS 配置

确保后端 `app/main.py` 中已允许 Vercel 域名跨域。检查 `CORSMiddleware` 的 `allow_origins` 是否包含你的 Vercel 域名，或设为 `["*"]`（生产环境建议指定具体域名）。

---

## 三、浏览器插件打包与分发

### 3.1 修改生产 API 地址

编辑 `extension/api.ts`，把 `BASE_URL` 从本地地址改为生产后端地址：

```ts
const BASE_URL = "https://你的后端域名";
```

### 3.2 打包插件

```bash
cd extension
npm run build
```

Plasmo 会在 `build/` 目录下生成 `chrome-mv3-prod/` 文件夹，里面包含：
- `manifest.json`
- `popup.html`
- `popup.xxx.js`
- `offscreen.html` / `offscreen.xxx.js`
- 图标资源等

### 3.3 本地加载测试（可选）

在正式上线前，先把 `build/chrome-mv3-prod/` 作为「已解压的扩展程序」加载到 Chrome，确认所有功能（包括语音输入、智能提取、入库）都正常。

### 3.4 上架 Chrome Web Store

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. 点击 **New Item**，上传 `build/chrome-mv3-prod/` 的 zip 压缩包
3. 填写商店信息：
   - 名称：AI 工作复盘助手
   - 描述：AI 驱动的轻量工作复盘工具，支持语音输入、碎片提取、一键生成复盘报告
   - 分类：生产力工具 / 扩展程序
4. 提交审核（通常 1-3 个工作日）

### 3.5 插件权限说明

上架时需要在描述中解释以下权限用途：
- `offscreen`（如果仍保留相关代码）：用于语音识别的持久上下文（当前版本已直接在 popup 中实现，可清理）
- `storage`：记住用户上次选择的项目
- `host_permissions`：访问后端 API 和本地开发服务器

---

## 四、部署检查清单

| 检查项 | 状态 |
|---|---|
| 后端在 Render/Railway 成功启动 | ⬜ |
| 数据库迁移成功，表已创建 | ⬜ |
| `/projects` 和 `/fragments/extract` 接口可正常访问 | ⬜ |
| Web 在 Vercel 成功部署 | ⬜ |
| Web 能正常连接后端 API | ⬜ |
| 插件 `api.ts` 已改为生产地址 | ⬜ |
| 插件 `npm run build` 成功 | ⬜ |
| 插件本地加载测试通过 | ⬜ |
| 提交 Chrome Web Store 审核 | ⬜ |

---

## 五、关键注意事项

1. **API Key 安全**：`ANTHROPIC_API_KEY` 只存在于后端环境变量中，**永远不要写进前端或插件代码**。
2. **端口问题**：当前开发环境使用 8002 端口，生产环境不需要关心这个，Render/Railway 会提供 `$PORT`。
3. **数据库迁移**：每次修改 Model 后，都要在本地生成新的 Alembic 版本并应用到生产数据库。
4. **CORS**：生产环境的 `allow_origins` 建议只放 Vercel 域名和 Chrome 扩展的 `chrome-extension://` ID。
5. **插件更新**：Chrome Web Store 审核通过后，后续更新只需要重新打包 zip 上传新版本。

---

## 六、快速开始命令（一次性跑通）

```bash
# 1. 后端：确认 requirements.txt 包含 gunicorn
cd backend
echo "gunicorn" >> requirements.txt

# 2. Web：确认 next.config.js 输出为 standalone（可选优化）
cd ../web
# 默认 next build 即可，Vercel 会处理好

# 3. 插件：打包生产版本
cd ../extension
npm run build
```

然后分别按上面的步骤在 Render、Vercel、Chrome Web Store 提交即可。
