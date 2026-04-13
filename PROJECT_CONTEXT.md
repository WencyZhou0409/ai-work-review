# 项目上下文 / 进度看板

## 当前阶段

**阶段 2: 数据层与接口设计** — 已完成

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

## 待完成/待注意

- [ ] 配置真实的 PostgreSQL 数据库后，运行 `alembic upgrade head` 执行首版迁移建表
- [ ] 将 `.env` 中的 `DATABASE_URL` 改为真实的 PostgreSQL 连接（目前 `.env` 保留模板值）
- [ ] 将 `KIMI_API_KEY` 填入 `.env`

## 下一阶段计划

**阶段 3: 后端 AI 引擎与核心业务逻辑**
- 封装 Kimi API 调用客户端（`backend/app/services/llm.py`）
- 实现真正的 `POST /fragments/extract`（Prompt1：碎片提取）
- 实现真正的 `POST /projects/{id}/generate`（Prompt2：复盘重组）
- 接入真实数据库，确保端到端流程可跑通

## 当前阻塞点

无。

## 下次对话建议切入点

直接开始 **阶段 3：后端 AI 引擎与核心业务逻辑**。开始之前，请确保：
1. 本地或云端已有一个可用的 PostgreSQL 数据库；
2. `backend/.env` 中已填入正确的 `DATABASE_URL` 和你的 `KIMI_API_KEY`。
