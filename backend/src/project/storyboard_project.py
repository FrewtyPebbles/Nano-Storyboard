from __future__ import annotations

from enum import Enum
from typing import List, Optional

from sqlalchemy import ForeignKey, Integer, String, Text, Enum as SqlEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from src.project.character import Character
from src.project.panel import Panel

class Base(DeclarativeBase):
    pass

class StoryBoardProject(Base):
    __tablename__ = "storyboard_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    genre: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    premise: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visual_tone: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    characters: Mapped[List["Character"]] = relationship(
        back_populates="storyboard_project",
        cascade="all, delete-orphan"
    )

    panels: Mapped[List["Panel"]] = relationship(
        back_populates="storyboard_project",
        cascade="all, delete-orphan",
        order_by="Panel.sequence"
    )