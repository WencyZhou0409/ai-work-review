from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FragmentFactBase(BaseModel):
    fragment_id: int
    category: str
    fact_text: str


class FragmentFactOut(FragmentFactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
