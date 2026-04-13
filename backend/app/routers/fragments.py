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
from app.services.ai_extract_service import extract_facts

router = APIRouter(prefix="/fragments", tags=["Fragments"])


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
    facts_data = await extract_facts(body.raw_text, body.project_id)
    return ResponseModel(data=ExtractResponse(facts=facts_data))
