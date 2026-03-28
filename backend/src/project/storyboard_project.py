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

from sqlalchemy import ColumnExpressionArgument, Integer, Sequence, String, Text, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session, selectinload

from src.shared import Base
from src.project.character import Character
from src.project.panel import Panel


class StoryBoardProject(Base):
    __tablename__ = "storyboard_project"

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

    @classmethod
    def list(cls, session: Session) -> Sequence["StoryBoardProject"]:
        stmt = select(StoryBoardProject)\
            .options(selectinload(cls.characters), selectinload(cls.panels))
        return session.scalars().all()

    @classmethod
    def create(cls, session: Session, title: str, genre: str | None = None, premise: str | None = None, visual_tone: str | None = None) -> StoryBoardProject:
        project = cls(title=title, genre=genre, premise=premise, visual_tone=visual_tone)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


    def get_characters(self, session: Session) -> List[Character]:
        project = session.get(StoryBoardProject, self.id)
        if not project:
            return []
        return project.characters

    def get_panels(self, session: Session) -> List[Panel]:
        project = session.get(StoryBoardProject, self.id)
        if not project:
            return []
        return project.panels

    def update(self, session: Session, **kwargs) -> StoryBoardProject | None:
        project = session.get(StoryBoardProject, self.id)
        if not project:
            return None
        for key, value in kwargs.items():
            setattr(project, key, value)
        session.commit()
        session.refresh(project)
        return project

    def delete(self, session: Session):
        project = session.get(StoryBoardProject, self.id)
        session.delete(project)

    @classmethod
    def get(cls, session:Session, where_clause:ColumnExpressionArgument[bool]) -> Sequence["StoryBoardProject"]:
        stmt = select(Panel)\
            .options(selectinload(cls.characters), selectinload(cls.panels)) \
            .where(where_clause)
        return session.scalars(stmt).all()