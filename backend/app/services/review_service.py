from __future__ import annotations

import json
import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.fragment import get_fragment
from app.crud.project import get_project
from app.schemas.review import GenerateReviewResponse
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

    content = await chat_completion(messages=messages, temperature=0.3)

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
