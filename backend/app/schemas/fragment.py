from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.fragment_fact import FragmentFactOut


class FragmentBase(BaseModel):
    project_id: int
    raw_content: str
    source_type: str
    status: str = "active"


class FragmentCreate(FragmentBase):
    pass


class FragmentUpdate(BaseModel):
    raw_content: str | None = None
    status: str | None = None


class FragmentOut(FragmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    facts: list[FragmentFactOut] = []
