"""  
session.add(obj)        # insert / update
session.get(Model, id)  # select by primary key
session.delete(obj)     # delete
session.commit()
session.refresh(obj)    # reload from DB after commit

For queries beyond get-by-id:
from sqlalchemy import select

session.execute(select(StoryBoardProject)).scalars().all()         # get all
session.execute(select(StoryBoardProject).where(StoryBoardProject.genre == "Comedy")).scalars().first()  # filtered"""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from src.shared import Base
from src.project.character import Character
from src.project.panel import Panel


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


def create_project(session: Session, title: str, genre: str = None, premise: str = None, visual_tone: str = None) -> StoryBoardProject:
    project = StoryBoardProject(title=title, genre=genre, premise=premise, visual_tone=visual_tone)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


def get_characters(session: Session, story_board_id: int) -> List[Character]:
     project = session.get(StoryBoardProject, story_board_id)
     if not project:
         return []
     return project.characters

def get_panels(session: Session, story_board_id: int) -> List[Panel]:
    project = session.get(StoryBoardProject, story_board_id)
    if not project:
        return []
    return project.panels



