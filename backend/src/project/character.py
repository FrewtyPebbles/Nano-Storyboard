from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from enum import Enum


class Base(DeclarativeBase):
    pass

class Gender(Enum):
    MALE = "male"
    FEMALE = "female"

class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    storyboard_project_id: Mapped[int] = mapped_column(ForeignKey("storyboard_project.id"))
    name: Mapped[str]
    age: Mapped[int]
    gender: Mapped[Gender]
    physical_description: Mapped[str]
    back_story: Mapped[str]
    image: Mapped[str] = mapped_column(String(255))

    def __repr__(self):
        return f"Character(id={self.id!r}, storyboard_project_id={self.storyboard_project_id!r}, name={self.name!r}, age={self.age!r}, gender={self.gender!r}, physical_description={self.physical_description!r}, back_story={self.back_story!r}, image={self.image!r})"