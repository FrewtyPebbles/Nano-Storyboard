from __future__ import annotations

import shutil
from enum import Enum
from pathlib import Path
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Enum as SqlEnum, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from src.shared import Base, GEMINI_CLIENT
from google.genai import types

if TYPE_CHECKING:
    from src.project.storyboard_project import StoryBoardProject


class Gender(Enum):
    MALE = "male"
    FEMALE = "female"


class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    storyboard_project_id: Mapped[int] = mapped_column(ForeignKey("storyboard_project.id"))
    name: Mapped[str]
    age: Mapped[int]
    gender: Mapped[Gender] = mapped_column(SqlEnum(Gender))
    physical_description: Mapped[str]
    back_story: Mapped[Optional[str]]
    image: Mapped[Optional[str]] = mapped_column(String(255))

    storyboard_project: Mapped["StoryBoardProject"] = relationship(back_populates="characters")

    def __repr__(self):
        return f"Character(id={self.id!r}, storyboard_project_id={self.storyboard_project_id!r}, name={self.name!r}, age={self.age!r}, gender={self.gender!r}, physical_description={self.physical_description!r}, back_story={self.back_story!r}, image={self.image!r})"

    @classmethod
    def create(cls, session: Session, storyboard_project_id: int, name: str, age: int, gender: Gender, physical_description: str, back_story: str | None = None) -> "Character":
        character = cls(
            storyboard_project_id=storyboard_project_id,
            name=name,
            age=age,
            gender=gender,
            physical_description=physical_description,
            back_story=back_story,
        )
        session.add(character)
        session.commit()
        session.refresh(character)
        return character

    @classmethod
    def get(cls, session: Session, character_id: int) -> "Character | None":
        return session.get(cls, character_id)

    def delete(self, session: Session) -> None:
        project: StoryBoardProject = self.storyboard_project
        character_folder = Path("./uploads/projects", repr(project.id), "characters", repr(self.id))
        if character_folder.exists():
            shutil.rmtree(character_folder)
        session.delete(self)
        session.commit()

    def add_physical_characteristics(self, session: Session, characteristics: str) -> "Character":
        project: StoryBoardProject = self.storyboard_project
        character_folder = Path("./uploads/projects", repr(project.id), "characters", repr(self.id))

        # load existing images into memory before deleting
        reference_images: list[bytes] = []
        if character_folder.exists():
            for f in sorted(character_folder.iterdir()):
                if f.is_file():
                    reference_images.append(f.read_bytes())
            shutil.rmtree(character_folder)

        self.physical_description = self.physical_description + ", " + characteristics
        self.generate(reference_images=reference_images)
        session.commit()
        session.refresh(self)
        return self

    def edit_character(self, session: Session, **kwargs) -> "Character":
        project: StoryBoardProject = self.storyboard_project
        character_folder = Path("./uploads/projects", repr(project.id), "characters", repr(self.id))

        # load existing images into memory before deleting
        reference_images: list[bytes] = []
        if character_folder.exists():
            for f in sorted(character_folder.iterdir()):
                if f.is_file():
                    reference_images.append(f.read_bytes())
            shutil.rmtree(character_folder)

        for key, value in kwargs.items():
            setattr(self, key, value)
        self.generate(reference_images=reference_images)
        session.commit()
        session.refresh(self)
        return self

    def update(self, session: Session, **kwargs) -> "Character":
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.generate()
        session.commit()
        session.refresh(self)
        return self

    def regenerate(self, session: Session, notes: str) -> "Character":
        project: StoryBoardProject = self.storyboard_project
        character_folder = Path("./uploads/projects", repr(project.id), "characters", repr(self.id))

        reference_images: list[bytes] = []
        if character_folder.exists():
            for f in sorted(character_folder.iterdir()):
                if f.is_file():
                    reference_images.append(f.read_bytes())
            shutil.rmtree(character_folder)

        self.generate(reference_images=reference_images, notes=notes)
        session.commit()
        session.refresh(self)
        return self

    def generate(self, reference_images: list[bytes] | None = None, notes: str | None = None):
        project: StoryBoardProject = self.storyboard_project

        character_folder = Path("./uploads/projects", repr(project.id), "characters", repr(self.id))
        character_folder.mkdir(exist_ok=True, parents=True)

        data = {
            "name": self.name,
            "age": self.age,
            "gender": self.gender.value,
            "physical description": self.physical_description,
            "back story": self.back_story,
            "visual tone": project.visual_tone,
        }

        # strip None values
        data = {k: v for k, v in data.items() if v is not None}

        notes_injection = f" Additional adjustment notes: {notes}." if notes else ""

        if reference_images:
            prompt = (
                "Generate an updated character reference image for a storyboard. "
                "Draw this as a sketch illustration, no border or margin. "
                "Use the provided reference images to maintain visual consistency with the existing design. "
                "Incorporate the following updated character description: " + repr(data) + notes_injection
            )
            contents = [
                *[types.Part.from_bytes(data=img, mime_type="image/png") for img in reference_images],
                prompt,
            ]
        else:
            prompt = (
                "Generate a character reference image for a storyboard. "
                "Draw this as a sketch illustration, no border or margin. "
                "Based on this character description: " + repr(data) + notes_injection
            )
            contents = [prompt]

        response = GEMINI_CLIENT.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            )
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                image_path = character_folder / "1.png"
                image_path.write_bytes(part.inline_data.data)
                self.image = str(image_path)
    
    