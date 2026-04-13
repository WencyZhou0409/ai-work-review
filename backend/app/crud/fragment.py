from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fragment import Fragment
from app.schemas.fragment import FragmentCreate, FragmentUpdate


async def create_fragment(db: AsyncSession, obj_in: FragmentCreate) -> Fragment:
    db_obj = Fragment(
        project_id=obj_in.project_id,
        raw_content=obj_in.raw_content,
        source_type=obj_in.source_type,
        status=obj_in.status,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_fragment(db: AsyncSession, fragment_id: int) -> Fragment | None:
    result = await db.execute(select(Fragment).where(Fragment.id == fragment_id))
    return result.scalar_one_or_none()


async def list_fragments(
    db: AsyncSession,
    project_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
) -> list[Fragment]:
    stmt = select(Fragment)
    if project_id is not None:
        stmt = stmt.where(Fragment.project_id == project_id)
    if status is not None:
        stmt = stmt.where(Fragment.status == status)
    stmt = stmt.offset(skip).limit(limit).order_by(Fragment.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_fragment(
    db: AsyncSession, fragment: Fragment, obj_in: FragmentUpdate
) -> Fragment:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fragment, field, value)
    db.add(fragment)
    await db.commit()
    await db.refresh(fragment)
    return fragment


async def delete_fragment(db: AsyncSession, fragment: Fragment) -> None:
    await db.delete(fragment)
    await db.commit()
