# 项目上下文 / 进度看板

## 当前阶段

**MVP 核心功能已完成，正在进行功能补齐与端到端打磨**

## 已完成的工作

- [x] 初始化 Git 仓库，提交 PRD.md
- [x] 创建 `backend/`、`web/`、`extension/` 三个子目录
- [x] 初始化 Next.js Web 项目（含 Tailwind CSS + TypeScript）
- [x] 手动搭建 Plasmo 插件最小项目结构并安装依赖
- [x] 创建 FastAPI 后端目录结构、requirements.txt、.gitignore、.env.example
- [x] 创建根目录 `.gitignore`、`DEVELOPMENT_GUIDE.md`
- [x] 提交阶段 1 的所有初始代码到 Git
- [x] 设计并实现 PostgreSQL 数据模型（projects、fragments、fragment_facts）
- [x] 编写 Pydantic Schema（统一响应包装器、Project、Fragment、FragmentFact、Review）
- [x] 实现 CRUD 层（project、fragment、fragment_fact）
- [x] 搭建 API 路由骨架（`/projects`、`/fragments`，含 AI extract 和 generate mock）
- [x] 配置 Alembic 异步迁移环境
- [x] 编写 pytest 测试（9 个测试全部通过）
- [x] 本地启动服务验证 Swagger 文档可访问
- [x] 提交阶段 2 代码到 Git
- [x] 接入真实 Supabase PostgreSQL 数据库，运行 `alembic upgrade head` 成功建表
- [x] 封装 Kimi API 调用客户端（`backend/app/services/llm.py`）
- [x] 实现真实的 `POST /fragments/extract`（Prompt1：碎片提取）
- [x] 实现真实的 `POST /projects/{id}/generate`（Prompt2：复盘重组）
- [x] 更新 fragment 创建流程，支持可选 facts 批量入库
- [x] 修复 Alembic `env.py` 对 `%` 密码的解析问题
- [x] 修复 `FragmentFactOut` 的 `created_at` 默认值缺失导致的验证错误
- [x] 更新测试以 mock LLM 调用，11 个测试全部通过
- [x] 真实 API 端到端验证通过
- [x] 提交阶段 3 代码到 Git
- [x] 实现 Web 主平台端左侧边栏（项目列表 + 新建项目弹窗）
- [x] 实现碎片 Feed 流（来源标签、时间戳、facts、勾选、丢弃/恢复）
- [x] 实现复盘输出面板（汇报模式 + 简历模式双卡片，一键复制）
- [x] 封装前端 API 客户端（`web/lib/api.ts`）
- [x] Web 端与后端联调通过，页面可正常访问 `http://localhost:3000`
- [x] 提交阶段 4 代码到 Git
- [x] 实现浏览器插件 popup 悬浮窗（宽度 360px，文本输入 + 项目选择器）
- [x] 实现项目下拉选择器，通过 `chrome.storage.local` 记住上次选择
- [x] 实现「智能提取」调用后端 `/fragments/extract`
- [x] 实现提取结果展示与手动编辑，支持「确认入库」调用 `/fragments`
- [x] 修复 Plasmo tsconfig 编译问题，插件可成功打包
- [x] 提交阶段 5 代码到 Git
- [x] Web 端新增项目删除功能（Sidebar 悬停显示删除按钮 + confirm 确认）
- [x] **UI 统一（Glassmorphism）**：统一 Web 端与插件端的配色、圆角、字体层级
- [x] **深色模式**：Web 端支持 `darkMode: 'class'`，提供无闪烁切换与 ThemeToggle 组件
- [x] **空状态 / Loading / 错误提示**：补齐所有组件的空状态、加载态和错误态展示
- [x] **后端开发降级**：当 `APP_ENV=development` 且 Kimi API 调用失败时，自动生成 mock 复盘内容
- [x] **部署文档**：编写 `README.md`，包含 Render/Railway、Vercel、Chrome Web Store 的部署说明
- [x] 提交阶段 6 代码到 Git

## 最近一次对话完成的核心工作（2026-04-14）

1. **后端 LLM 协议切换**：将 LLM 调用从 OpenAI 兼容接口切换为 Anthropic SDK，以适配用户可用的 Kimi coding 代理（`https://api.kimi.com/coding/`）。真实 AI 提取与复盘生成已验证通过。
2. **Web 端直接录入碎片**：在 `FragmentFeed` 顶部新增输入区，用户可直接在 Web 端手动添加碎片，无需完全依赖插件。对应新增 `web/lib/api.ts` 的 `createFragment` 封装。
3. **插件端语音输入实现**：通过 Chrome Extension Offscreen API 实现 popup 内的 🎤 语音转文字。新增 `extension/offscreen.html` 和 `offscreen.js` 作为 Web Speech API 的持久上下文载体。
4. **状态与 Loading 提示完善**：`OutputPanel` 在生成复盘时展示旋转加载指示器；`FragmentFeed` 空状态文案同步更新。

## 关键变更文件

- `backend/app/services/llm.py` — Anthropic SDK 接入
- `backend/app/core/config.py` — 新增 Anthropic 配置项
- `backend/.env` — 配置 Anthropic 环境变量
- `web/lib/api.ts` — 新增 `createFragment`；API 地址适配
- `web/app/components/FragmentFeed.tsx` — 新增直接输入区
- `web/app/components/OutputPanel.tsx` — 增加生成中 Loading 指示器
- `web/app/page.tsx` — 新增 `handleCreateFragment` 回调
- `extension/package.json` — 补充 `permissions: ["offscreen"]`
- `extension/popup.tsx` — 实现语音输入通信逻辑与聆听状态提示
- `extension/offscreen.html` — 新建：承载 Web Speech API
- `extension/offscreen.js` — 新建：语音识别核心逻辑
- `extension/api.ts` — 插件 API 地址适配

## 待完成/待注意

- [ ] **端口归一化**：Windows 开发机上 8001 端口因僵尸 Uvicorn 连接暂时不可用，后端、Web、插件当前均指向 8002。待系统释放 8001 后切回标准端口。
- [ ] **真机语音测试**：插件端语音输入需在 Chrome 扩展管理页刷新后，点击 🎤 验证识别结果是否正确填充。
- [ ] **Web 录入真机测试**：浏览器打开 `http://localhost:3000`，在输入框录入碎片并确认出现在 Feed 流中。
- [ ] 生产环境部署前，请确认 `backend/.env` 中的 `ANTHROPIC_API_KEY` 有效且 `APP_ENV=production`

## 当前阻塞点

- **Windows 8001 端口被僵尸连接占用**：此前多次启动/终止 Uvicorn 导致 Windows 系统层残留 orphaned socket，新的 Uvicorn 进程无法绑定 `127.0.0.1:8001`。当前后端临时运行在 `0.0.0.0:8002`，Web 与插件 API 地址同步指向 `8002`。通常等待 2-5 分钟后系统会自动清理，届时可切回 8001。

## 下次对话建议切入点

1. **端口归一化收尾 + 完整端到端手动验收**：新建项目 → Web/插件录入 → 丢弃/恢复 → 生成复盘 → 复制结果。
2. **生产环境部署配置**：Render / Railway 后端、Vercel Web、Chrome Web Store 插件打包与分发。
3. **AI Prompt 精细化调优**：针对真实业务场景调整提取和复盘 Prompt，优化输出质量。
