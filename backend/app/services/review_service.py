from __future__ import annotations

import json
import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.fragment import get_fragment
from app.crud.project import get_project
from app.schemas.review import GenerateReviewResponse
from app.core.config import settings
from app.services.llm import build_review_prompt, chat_completion


async def generate_review(
    project_id: int, fragment_ids: list[int], db: AsyncSession
) -> GenerateReviewResponse:
    """调用 Kimi API 生成汇报模式和简历模式复盘文档。"""
    project = await get_project(db, project_id)
    if not project:
        raise ValueError("项目不存在")

    fragments_data = []
    for fid in fragment_ids:
        fragment = await get_fragment(db, fid)
        if not fragment or fragment.project_id != project_id:
            continue
        facts = [
            {"category": f.category, "fact": f.fact_text}
            for f in fragment.facts
        ]
        fragments_data.append(
            {
                "raw_content": fragment.raw_content,
                "source_type": fragment.source_type,
                "created_at": fragment.created_at.isoformat() if fragment.created_at else "",
                "facts": facts,
            }
        )

    if not fragments_data:
        return GenerateReviewResponse(
            report_mode="当前选中的碎片暂无可用于复盘的事实内容。",
            resume_mode="- 【待补充】当前碎片库内容不足，请补充更多工作记录后再试。",
        )

    fragments_json = json.dumps(fragments_data, ensure_ascii=False, indent=2)
    prompt = build_review_prompt(project.name, project.goal, fragments_json)
    messages = [{"role": "user", "content": prompt}]

    try:
        content = await chat_completion(messages=messages, temperature=0.3)
    except Exception:
        if settings.APP_ENV == "development":
            # 开发环境降级返回 mock 内容，便于端到端验证
            return GenerateReviewResponse(
                report_mode=f"【开发环境模拟】基于项目「{project.name}」的 {len(fragments_data)} 条碎片，梳理出以下汇报内容：\n\n"
                              f"1. 业务背景与目标：{project.goal or '暂无明确目标'}\n"
                              f"2. 关键动作：从碎片中识别到 {sum(len(f['facts']) for f in fragments_data)} 条结构化事实。\n"
                              f"3. 结果与进展：详见碎片原始记录。\n\n"
                              f"（此为开发降级内容，生产环境配置有效 Kimi API Key 后将调用真实 AI 生成。）",
                resume_mode="- 【策略分析】梳理并归档多源工作碎片，建立结构化事实体系，支撑后续复盘与汇报。\n"
                             "- 【数据洞察】从碎片中提取关键业务数据与执行动作，形成可追溯的项目资产。",
            )
        raise

    # 解析输出
    report_match = re.search(
        r"\[视角 A：汇报模式\]\s*(.*?)\s*(?=\[视角 B：简历模式\]|$)",
        content,
        re.DOTALL,
    )
    resume_match = re.search(
        r"\[视角 B：简历模式\]\s*(.*)", content, re.DOTALL
    )

    report_mode = report_match.group(1).strip() if report_match else content.strip()
    resume_mode = resume_match.group(1).strip() if resume_match else ""

    return GenerateReviewResponse(
        report_mode=report_mode,
        resume_mode=resume_mode,
    )
