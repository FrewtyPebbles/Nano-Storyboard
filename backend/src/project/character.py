from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.shared import Base

if TYPE_CHECKING:
    from src.project.storyboard_project import StoryBoardProject


class Gender(Enum):
    MALE = "male"
    FEMALE = "female"


class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    storyboard_project_id: Mapped[int] = mapped_column(ForeignKey("storyboard_projects.id"))
    name: Mapped[str]
    age: Mapped[int]
    gender: Mapped[Gender] = mapped_column(SqlEnum(Gender))
    physical_description: Mapped[str]
    back_story: Mapped[str]
    image: Mapped[str] = mapped_column(String(255))

    storyboard_project: Mapped["StoryBoardProject"] = relationship(back_populates="characters")

    def __repr__(self):
        return f"Character(id={self.id!r}, storyboard_project_id={self.storyboard_project_id!r}, name={self.name!r}, age={self.age!r}, gender={self.gender!r}, physical_description={self.physical_description!r}, back_story={self.back_story!r}, image={self.image!r})"