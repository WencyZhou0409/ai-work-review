from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fragment_fact import FragmentFact
from app.schemas.fragment_fact import FragmentFactBase


async def create_fact(db: AsyncSession, obj_in: FragmentFactBase) -> FragmentFact:
    db_obj = FragmentFact(
        fragment_id=obj_in.fragment_id,
        category=obj_in.category,
        fact_text=obj_in.fact_text,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def list_facts_by_fragment(db: AsyncSession, fragment_id: int) -> list[FragmentFact]:
    result = await db.execute(
        select(FragmentFact).where(FragmentFact.fragment_id == fragment_id)
    )
    return list(result.scalars().all())


async def bulk_create_facts(
    db: AsyncSession, fragment_id: int, facts: list[dict]
) -> list[FragmentFact]:
    db_objs = [
        FragmentFact(
            fragment_id=fragment_id,
            category=fact["category"],
            fact_text=fact["fact_text"],
        )
        for fact in facts
    ]
    db.add_all(db_objs)
    await db.commit()
    for obj in db_objs:
        await db.refresh(obj)
    return db_objs
