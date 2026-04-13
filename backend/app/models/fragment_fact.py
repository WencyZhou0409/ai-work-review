from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FragmentFact(Base):
    __tablename__ = "fragment_facts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fragment_id: Mapped[int] = mapped_column(
        ForeignKey("fragments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    fact_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    fragment: Mapped["Fragment"] = relationship("Fragment", back_populates="facts")
