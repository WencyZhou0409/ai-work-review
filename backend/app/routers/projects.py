from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.project import (
    create_project,
    delete_project,
    get_project,
    list_projects,
    update_project,
)
from app.db.base import get_db
from app.schemas import (
    GenerateReviewRequest,
    GenerateReviewResponse,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    ResponseModel,
)
from app.services.review_service import generate_review

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ResponseModel[ProjectOut])
async def create_project_endpoint(
    obj_in: ProjectCreate, db: AsyncSession = Depends(get_db)
):
    project = await create_project(db, obj_in)
    return ResponseModel(data=project)


@router.get("", response_model=ResponseModel[list[ProjectOut]])
async def list_projects_endpoint(
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
    db: AsyncSession = Depends(get_db),
):
    projects = await list_projects(db, skip=skip, limit=limit, include_archived=include_archived)
    return ResponseModel(data=projects)


@router.get("/{project_id}", response_model=ResponseModel[ProjectOut])
async def get_project_endpoint(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return ResponseModel(data=project)


@router.put("/{project_id}", response_model=ResponseModel[ProjectOut])
async def update_project_endpoint(
    project_id: int,
    obj_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    updated = await update_project(db, project, obj_in)
    return ResponseModel(data=updated)


@router.delete("/{project_id}", response_model=ResponseModel[None])
async def delete_project_endpoint(
    project_id: int, db: AsyncSession = Depends(get_db)
):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    await delete_project(db, project)
    return ResponseModel(data=None)


@router.post("/{project_id}/generate", response_model=ResponseModel[GenerateReviewResponse])
async def generate_review_endpoint(
    project_id: int,
    body: GenerateReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await generate_review(project_id, body.fragment_ids, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=503, detail="AI 处理超时或失败，请重试")
    return ResponseModel(data=result)
