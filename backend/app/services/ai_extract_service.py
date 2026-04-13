from __future__ import annotations

from datetime import datetime, timezone

from app.schemas.fragment_fact import FragmentFactOut


async def extract_facts(raw_text: str, project_id: int) -> list[FragmentFactOut]:
    """Phase 2 mock: 返回固定 mock 数据，不调用外部 API。"""
    now = datetime.now(timezone.utc)
    return [
        FragmentFactOut(
            id=0,
            fragment_id=0,
            category="background",
            fact_text="发现业务卡点或数据异常（mock）",
            created_at=now,
        ),
        FragmentFactOut(
            id=0,
            fragment_id=0,
            category="strategy",
            fact_text="提出备选方案或执行策略（mock）",
            created_at=now,
        ),
    ]
