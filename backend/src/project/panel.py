from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Text, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared import Base

if TYPE_CHECKING:
    from src.project.storyboard_project import StoryBoardProject


class CameraShot(str, Enum):
    WIDE = "wide"
    MEDIUM = "medium"
    CLOSE_UP = "close_up"
    OVER_THE_SHOULDER = "over_the_shoulder"
    BIRDSEYE = "birdseye"
    LOW_ANGLE = "low_angle"
    HIGH_ANGLE = "high_angle"
    FPOV = "first_person_point_of_view"


class Panel(Base):
    __tablename__ = "panels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    story_board_project_id: Mapped[int] = mapped_column(
        ForeignKey("storyboard_projects.id", ondelete="CASCADE"),
        nullable=False
    )
    camera_shot: Mapped[Optional[CameraShot]] = mapped_column(
        SqlEnum(CameraShot),
        nullable=True
    )
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    time: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dialogue: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    storyboard_project: Mapped["StoryBoardProject"] = relationship(
        back_populates="panels"
    )

    
