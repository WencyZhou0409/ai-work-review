from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.fragment import get_fragment
from app.schemas.review import GenerateReviewResponse


async def generate_review(
    project_id: int, fragment_ids: list[int], db: AsyncSession
) -> GenerateReviewResponse:
    """Phase 2 mock: 校验 fragment_ids 是否属于该项目，返回固定 mock 字符串。"""
    for fid in fragment_ids:
        fragment = await get_fragment(db, fid)
        if not fragment or fragment.project_id != project_id:
            continue  # Phase 2 仅做弱校验，不抛异常

    return GenerateReviewResponse(
        report_mode="【汇报模式】（mock）本次迭代针对业务卡点进行了策略优化，最终实现核心指标正向提升。",
        resume_mode="【简历模式】（mock）\n- 【策略优化】负责制定并落地 xxx 策略，实现核心指标提升。",
    )
