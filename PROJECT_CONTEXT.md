# 项目上下文 / 进度看板

## 当前阶段

**阶段 3: 后端 AI 引擎与核心业务逻辑** — 已完成

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

## 待完成/待注意

- [x] `.env` 已配置真实数据库连接和 `KIMI_API_KEY`（已加入 `.gitignore`，不会提交）
- [ ] 清理可能残留的旧 uvicorn 进程（如有）

## 下一阶段计划

**阶段 4: Web 主平台端（深度管理与复盘）**
- 左侧边栏：项目/标签列表，支持新建（名称 + 核心目标）、编辑
- 右侧工作区：按 Tag 筛选的碎片 Feed 流（来源 Icon、时间戳、核心要素）
- 碎片卡片：支持 Checkbox 勾选/取消，支持"丢弃"标记
- 输出区：点击"生成复盘"后，展示"汇报模式"和"简历模式"双栏/双卡片，支持一键复制

## 当前阻塞点

无。

## 下次对话建议切入点

直接开始 **阶段 4：Web 主平台端**。开始之前，请确保：
1. 后端服务 `uvicorn app.main:app --reload` 可以正常启动并访问 `http://localhost:8000/docs`；
2. Web 端 `cd web && npm run dev` 可以正常启动（ Next.js 已在阶段 1 初始化）。
