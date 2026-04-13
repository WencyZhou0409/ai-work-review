from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.project import get_project
from app.schemas.fragment_fact import FragmentFactOut
from app.services.llm import build_extract_prompt, chat_completion


async def extract_facts(
    raw_text: str, project_id: int, db: AsyncSession
) -> list[FragmentFactOut]:
    """调用 Kimi API 提取结构化业务事实。"""
    project = await get_project(db, project_id)
    if not project:
        raise ValueError("项目不存在")

    prompt = build_extract_prompt(project.name, project.goal, raw_text)
    messages = [{"role": "user", "content": prompt}]

    content = await chat_completion(
        messages=messages,
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    # 清理可能的 markdown 代码块
    cleaned = re.sub(r"^```json\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
    data = json.loads(cleaned)
    extracted = data.get("extracted_facts", [])

    facts = []
    now = datetime.now(timezone.utc)
    for item in extracted:
        facts.append(
            FragmentFactOut(
                id=0,
                fragment_id=0,
                category=item.get("category", "其他洞察"),
                fact_text=item.get("fact", ""),
                created_at=now,
            )
        )
    return facts
