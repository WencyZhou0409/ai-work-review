from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.fragment import (
    create_fragment,
    delete_fragment,
    get_fragment,
    list_fragments,
    update_fragment,
)
from app.crud.fragment_fact import bulk_create_facts
from app.db.base import get_db
from app.schemas import (
    ExtractRequest,
    ExtractResponse,
    FragmentCreate,
    FragmentOut,
    FragmentUpdate,
    ResponseModel,
)
from app.core.config import settings
from app.services.ai_extract_service import extract_facts

router = APIRouter(prefix="/fragments", tags=["Fragments"])


@router.get("/debug-env", include_in_schema=False)
async def debug_env():
    return {"app_env": settings.APP_ENV, "anthropic_key_exists": bool(settings.ANTHROPIC_API_KEY)}


@router.post("", response_model=ResponseModel[FragmentOut])
async def create_fragment_endpoint(
    obj_in: FragmentCreate, db: AsyncSession = Depends(get_db)
):
    fragment = await create_fragment(db, obj_in)
    return ResponseModel(data=fragment)


@router.get("", response_model=ResponseModel[list[FragmentOut]])
async def list_fragments_endpoint(
    project_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    fragments = await list_fragments(
        db, project_id=project_id, skip=skip, limit=limit, status=status
    )
    return ResponseModel(data=fragments)


@router.get("/{fragment_id}", response_model=ResponseModel[FragmentOut])
async def get_fragment_endpoint(
    fragment_id: int, db: AsyncSession = Depends(get_db)
):
    fragment = await get_fragment(db, fragment_id)
    if not fragment:
        raise HTTPException(status_code=404, detail="碎片不存在")
    return ResponseModel(data=fragment)


@router.put("/{fragment_id}", response_model=ResponseModel[FragmentOut])
async def update_fragment_endpoint(
    fragment_id: int,
    obj_in: FragmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    fragment = await get_fragment(db, fragment_id)
    if not fragment:
        raise HTTPException(status_code=404, detail="碎片不存在")
    updated = await update_fragment(db, fragment, obj_in)
    return ResponseModel(data=updated)


@router.delete("/{fragment_id}", response_model=ResponseModel[None])
async def delete_fragment_endpoint(
    fragment_id: int, db: AsyncSession = Depends(get_db)
):
    fragment = await get_fragment(db, fragment_id)
    if not fragment:
        raise HTTPException(status_code=404, detail="碎片不存在")
    await delete_fragment(db, fragment)
    return ResponseModel(data=None)


@router.post("/extract", response_model=ResponseModel[ExtractResponse])
async def extract_facts_endpoint(
    body: ExtractRequest, db: AsyncSession = Depends(get_db)
):
    try:
        facts_data = await extract_facts(body.raw_text, body.project_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        if settings.APP_ENV == "development":
            # 开发环境降级返回 mock 提取结果，便于端到端验证
            from datetime import datetime, timezone
            from app.schemas.fragment_fact import FragmentFactOut

            mock_facts = [
                FragmentFactOut(
                    id=0,
                    fragment_id=0,
                    category="策略/动作",
                    fact_text=f"【开发环境模拟】从输入内容中提取到关键动作。",
                    created_at=datetime.now(timezone.utc),
                ),
                FragmentFactOut(
                    id=0,
                    fragment_id=0,
                    category="其他洞察",
                    fact_text="（真实 AI 提取请配置有效的 KIMI_API_KEY 并设置 APP_ENV=production）",
                    created_at=datetime.now(timezone.utc),
                ),
            ]
            return ResponseModel(data=ExtractResponse(facts=mock_facts))
        raise HTTPException(status_code=503, detail="AI 处理超时或失败，请重试")
    return ResponseModel(data=ExtractResponse(facts=facts_data))
