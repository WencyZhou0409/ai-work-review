# AI 工作复盘助手 —— 项目总结

## 一、项目概述

**AI 工作复盘助手**是一个面向职场人的「全栈 AI 工作复盘工具」，旨在解决工作碎片化导致的复盘困难问题。用户可以通过浏览器插件随时捕获工作碎片（文字/语音），由 AI 自动提取核心事实；在 Web 端进行统一管理和筛选后，一键生成结构化的复盘报告（汇报模式 + 简历模式）。

项目目标：**用最低的认知负担，把碎片变成可复用的职业资产。**

---

## 二、技术栈

| 层级 | 技术选型 | 说明 |
|---|---|---|
| **Web 前端** | Next.js 14 + TypeScript + Tailwind CSS | 主平台，负责项目管理、碎片 Feed 流、复盘输出展示 |
| **浏览器插件** | Plasmo (MV3) + React + TypeScript | 轻量捕获端，支持文本输入和语音转文字 |
| **后端 API** | FastAPI + Python 3.11 | 异步 RESTful API，统一响应包装 |
| **数据库** | PostgreSQL (Supabase) | 异步 SQLAlchemy 2.0 + Alembic 迁移 |
| **AI 引擎** | Anthropic SDK (Kimi coding proxy) | 碎片事实提取 + 复盘报告生成 |
| **ORM/迁移** | SQLAlchemy 2.0 + Alembic | 全异步数据库操作 |
| **测试** | pytest + async fixtures | 后端接口测试覆盖 |

---

## 三、已完成的核心功能

### 1. Web 主平台
- **项目侧边栏**：新建项目、项目列表、删除项目、记住上次选择
- **碎片 Feed 流**：按项目筛选，展示来源标签（手动/插件）、时间戳、结构化 facts
- **碎片管理**：支持「丢弃/恢复」状态切换，丢弃后自动取消勾选并置灰
- **手动录入**：Feed 顶部提供输入区，可直接在 Web 端添加碎片（无需依赖插件）
- **复盘生成**：勾选碎片后一键生成「汇报模式」+「简历模式」双栏输出
- **复制功能**：一键复制复盘内容到剪贴板
- **加载状态**：生成复盘时展示旋转加载指示器，避免用户以为页面卡住
- **深色模式**：支持 `darkMode: 'class'` 切换，UI 采用统一的 Glassmorphism 风格

### 2. 浏览器插件（Plasmo MV3）
- **悬浮弹窗**：固定宽度 360px，简洁的文本输入 + 项目选择器
- **项目记忆**：通过 `chrome.storage.local` 记住上次选择的项目
- **AI 智能提取**：调用后端 `/fragments/extract`，展示 1-3 条结构化 facts，支持手动修改
- **确认入库**：提取结果可编辑后确认保存到数据库
- **语音输入**：支持 🎤 语音转文字，利用 `webkitSpeechRecognition` 在 popup 内直接运行
- **错误提示**：顶部红色错误条，覆盖网络异常、权限拒绝、AI 处理失败等场景

### 3. 后端服务
- **统一响应格式**：`{ code, data, message }`
- **项目 CRUD**：创建、列表、详情、更新、删除
- **碎片 CRUD**：创建（支持附带 facts）、列表、详情、更新、删除、按状态筛选
- **AI 提取接口**：`POST /fragments/extract` — 接收原始文本，调用 LLM 返回结构化 facts
- **复盘生成接口**：`POST /projects/{id}/generate` — 接收选中的碎片 ID 列表，调用 LLM 生成双模式复盘
- **开发降级**：当 `APP_ENV=development` 且 LLM 调用失败时，自动生成 mock 内容，保证开发流畅
- **Alembic 异步迁移**：已接入真实 Supabase PostgreSQL 并成功建表

### 4. 数据库 Schema
- `projects`：项目/标签表
- `fragments`：工作碎片表（含 `source_type`、`status` 等字段）
- `fragment_facts`：结构化事实表（1 对多关联碎片）

---

## 四、核心数据流

```
【捕获阶段】
插件/Web 录入 → POST /fragments/extract (AI 提取 facts)
                        ↓
            POST /fragments (带 facts 入库)
                        ↓
              PostgreSQL (Supabase)

【复盘阶段】
Web 勾选碎片 → POST /projects/{id}/generate
                        ↓
           Anthropic SDK (Kimi coding proxy)
                        ↓
         返回「汇报模式」+「简历模式」文案
                        ↓
              Web OutputPanel 展示 + 复制
```

---

## 五、关键卡点与解决方案

### 1. LLM 协议切换：从 OpenAI 到 Anthropic SDK
**问题**：最初后端使用 OpenAI 兼容接口调用 Kimi API，但在真实环境中频繁出现连接超时和 503 错误，导致 AI 提取和复盘生成不可用。

**解决**：将 LLM 调用层全面切换为 **Anthropic SDK**，并配置 `ANTHROPIC_BASE_URL=https://api.kimi.com/coding/` 指向用户可用的 Kimi coding 代理。切换后真实 AI 提取与复盘生成验证通过。

---

### 2. Windows 开发机 8001 端口被僵尸连接占用
**问题**：多次启动/终止 Uvicorn 后，Windows 系统层残留 orphaned socket，新的 Uvicorn 进程无法绑定 `127.0.0.1:8001`，报错 `Errno 10048`。

**解决**：尝试多种方式清理僵尸端口均失败（进程已消失但 socket 仍在 `TIME_WAIT`）。最终**将后端临时迁移至 8002 端口**，并同步更新 Web 端和插件端的 API base URL。当前开发环境在 8002 稳定运行。

---

### 3. 浏览器插件 MV3 下的语音输入实现
**问题**：Chrome Extension Manifest V3 的 popup 生命周期极短，`webkitSpeechRecognition` 需要持久上下文才能持续监听，直接在 popup 中调用会导致页面关闭后识别中断。

**解决路径**：
- 第一步：尝试使用 Chrome **Offscreen API**，新增 `offscreen.html` + `offscreen.js` 作为 Web Speech API 的持久载体。
- 第二步：发现 Plasmo dev server **未自动打包**根目录下的 offscreen 静态文件，导致加载时报 `Page failed to load`。
- 第三步：将 offscreen 文件改为 `offscreen.tsx` 作为 Plasmo 正规入口点，但仍遇到麦克风权限在 offscreen 文档中被静默拒绝（`not-allowed`）的问题。
- 第四步（最终方案）：**废弃 offscreen，直接在 popup 中使用 `webkitSpeechRecognition`**。利用用户点击 🎤 按钮产生的用户手势，先调用 `navigator.mediaDevices.getUserMedia({ audio: true })` 显式申请麦克风权限，通过后再启动语音识别。该方案在实测中稳定可用。

---

### 4. 麦克风权限申请机制
**问题**：即使 Chrome 设置中允许了麦克风，插件 popup 内的 `webkitSpeechRecognition` 仍报权限被拒绝。

**解决**：不依赖浏览器自动弹窗，而是在启动语音识别前**主动调用 `getUserMedia` 预检权限**。这样 Chrome 会强制弹出权限提示，用户点击「允许」后，`SpeechRecognition` 才能正常启动。同时在代码中对 `NotAllowedError`、`NotFoundError` 等做了中文错误映射，提升用户体验。

---

### 5. 数据库连接与编译缓存问题
**问题**：后端早期出现过「数据库连接已关闭」和修改代码后行为未更新的问题。

**解决**：
- 清理 `backend/**/__pycache__` 中的旧编译字节码
- 检查并修正 Supabase 连接字符串和连接池配置
- 使用干净端口（8002）重新启动 Uvicorn，确保加载的是最新代码

---

## 六、当前状态

**MVP 核心功能已 100% 完成，并通过了端到端手动验收。**

- Web 端：可新建项目、手动录入碎片、丢弃/恢复、生成复盘、复制结果
- 插件端：可选择项目、语音输入、智能提取、确认入库
- 后端：真实 AI 提取和复盘生成稳定可用
- 异常处理：网络断开、权限拒绝、AI 超时均有中文友好提示

**剩余可推进事项**：
1. **生产环境部署**：Render/Railway 后端、Vercel Web、Chrome Web Store 插件上架
2. **端口归一化**：待 Windows 释放 8001 后切回标准端口
3. **AI Prompt 精细化调优**：针对真实业务场景优化提取和复盘输出质量
4. **自动化测试补全**：目前以手动验收为主，可补充 E2E 测试

---

## 七、项目结构速览

```
AI工作复盘产品/
├── backend/          # FastAPI + SQLAlchemy + Alembic
├── web/              # Next.js 14 + Tailwind CSS
├── extension/        # Plasmo browser extension
├── PROJECT_CONTEXT.md # 开发进度看板
├── SUMUP.md          # 本文件
└── README.md         # 部署文档
```
