from __future__ import annotations

from pydantic import BaseModel

from app.schemas.fragment_fact import FragmentFactOut


class ExtractRequest(BaseModel):
    raw_text: str
    project_id: int


class ExtractResponse(BaseModel):
    facts: list[FragmentFactOut]


class GenerateReviewRequest(BaseModel):
    fragment_ids: list[int]


class GenerateReviewResponse(BaseModel):
    report_mode: str
    resume_mode: str
