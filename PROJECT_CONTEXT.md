# 项目上下文 / 进度看板

## 当前阶段

**阶段 5: 浏览器插件端（轻量捕获）** — 已完成

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
- [x] 解决 `api.kimi.com/coding/` 端点的 User-Agent 白名单兼容问题
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
- [x] 实现浏览器插件 popup 悬浮窗（宽度 360px，文本输入 + 语音输入）
- [x] 实现项目下拉选择器，通过 `chrome.storage.local` 记住上次选择
- [x] 实现「智能提取」调用后端 `/fragments/extract`
- [x] 实现提取结果展示与手动编辑，支持「确认入库」调用 `/fragments`
- [x] 修复 Plasmo tsconfig 编译问题，插件可成功打包
- [x] 提交阶段 5 代码到 Git

## 待完成/待注意

- [x] `.env` 已配置真实数据库连接和 `KIMI_API_KEY`（已加入 `.gitignore`，不会提交）
- [ ] Web 端缺少「新建碎片」的入口（目前依赖插件或 API 录入，属于增强项）
- [ ] 需要进行一次完整的端到端流程验证（插件录入 -> Web 端查看 -> 生成复盘）

## 下一阶段计划

**阶段 6: UI 统一、整合测试与部署配置**
- 统一 Web 端和插件端的视觉风格（Tailwind CSS + 配色、字体、间距）
- 完善空状态、Loading 状态、错误提示
- 端到端走通一次完整流程
- 编写部署配置/说明：后端 Render/Railway、Web Vercel、插件打包分发
- 整理根目录 README.md

## 当前阻塞点

无。

## 下次对话建议切入点

直接开始 **阶段 6：UI 统一、整合测试与部署配置**，或先进行一次端到端的手动验证：
1. 启动后端 `uvicorn app.main:app --reload`；
2. 启动 Web 端 `cd web && npm run dev`；
3. 启动插件开发模式 `cd extension && npm run dev`；
4. 在 Chrome 扩展管理中加载 `extension/build/chrome-mv3-dev` 目录；
5. 走一次：插件录入碎片 -> Web 端查看并勾选 -> 生成复盘 -> 复制结果。
