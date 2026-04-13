from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


async def create_project(db: AsyncSession, obj_in: ProjectCreate) -> Project:
    db_obj = Project(name=obj_in.name, goal=obj_in.goal)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_project(db: AsyncSession, project_id: int) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def list_projects(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
) -> list[Project]:
    stmt = select(Project)
    if not include_archived:
        stmt = stmt.where(Project.is_archived == False)
    stmt = stmt.offset(skip).limit(limit).order_by(Project.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_project(
    db: AsyncSession, project: Project, obj_in: ProjectUpdate
) -> Project:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project: Project) -> None:
    await db.delete(project)
    await db.commit()
