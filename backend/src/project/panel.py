from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, ColumnExpressionArgument, ForeignKey, Integer, Sequence, String, Table, Text, Enum as SqlEnum, select
from sqlalchemy.orm import Mapped, Session, mapped_column, relationship, selectinload

from src.project.character import Character
from src.shared import Base, GEMINI_CLIENT
from pathlib import Path
from PIL import Image
from google.genai import types

if TYPE_CHECKING:
    from src.project.storyboard_project import StoryBoardProject

panel_characters = Table(
    "panel_characters",
    Base.metadata,
    Column("panel_id", ForeignKey("panel.id", ondelete="CASCADE"), primary_key=True),
    Column("character_id", ForeignKey("character.id", ondelete="CASCADE"), primary_key=True),
)

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
    __tablename__ = "panel"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    story_board_project_id: Mapped[int] = mapped_column(
        ForeignKey("storyboard_project.id", ondelete="CASCADE"),
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

    characters: Mapped[list["Character"]] = relationship(
        secondary=panel_characters,
        backref="panels" 
    )

    @classmethod
    def list_panels(cls, session: Session):
        stmt = select(Panel) \
            .options(selectinload(StoryBoardProject.characters), selectinload(StoryBoardProject.panels))
        return session.scalars(stmt).all()
    
    @classmethod
    def create(cls,
        session:Session, sequence:int, story_board_project_id:int, camera_shot:CameraShot, character_ids: list[int] | None = None,
        location:str|None = None, time:str|None = None, action:str|None = None, dialogue:str|None = None,
        caption:str|None = None, image:str|None = None
        ):
        panel = cls(
            sequence=sequence, story_board_project_id=story_board_project_id,
            camera_shot=camera_shot, location=location, time=time, action=action,
            dialogue=dialogue, caption=caption, image=image
        )

        if character_ids:
            stmt = select(Character).where(Character.id.in_(character_ids))
            characters = session.scalars(stmt).all()
            panel.characters.extend(characters)

        session.add(panel)
        session.commit()
        return panel
    
    def get(self, session:Session, where_clause:ColumnExpressionArgument[bool]) -> Sequence["StoryBoardProject"]:
        stmt = select(Panel) \
            .options(selectinload(StoryBoardProject.characters), selectinload(StoryBoardProject.panels)) \
            .where(where_clause)
        return session.scalars(stmt).all()
    
    def generate(self):
        # Create the prompt
        project:StoryBoardProject = self.storyboard_project
        
        project_static_path = Path("./backend/uploads/projects", project.id)
        
        prompt = "Write only a description of a single storyboard drawing for an image generation ai and nothing else based on this json describing the scene. The \"character image numbers\" field in the objects in the \"characters\" list field represents which provided image corresponds to which character. These images will be supplied in this numbered order as reference images to nanobanana: "
        data = {
            "camera shot":self.camera_shot,
            "location":self.location,
            "time":self.time,
            "action":self.action,
            "dialogue":self.dialogue,
            "caption":self.caption,
            "story title":project.title,
            "genre":project.genre,
            "premise":project.premise,
            "visual tone":project.visual_tone,
            "characters":[],
        }

        character_images = []

        for character in self.characters:
            character_json = {
                "name":character.name,
                "age":character.age,
                "gender":character.gender.value,
                "physical description":character.physical_description,
                "back story":character.back_story,
            }

            character_json = {k: v for k, v in character_json.items() if v != None}
            data["characters"].append(character_json)

            # grab character images
            character_images_folder = project_static_path.joinpath(Path("characters", character.id))

            character_images_folder.mkdir(exist_ok=True)

            character_json["character image numbers"] = []

            for image_path in [f for f in character_images_folder.iterdir() if f.is_file()]:
                character_images.append(Image.open(image_path))
                character_json["character image numbers"].append(len(character_images))

        if len(character_images) > 14:
            raise RuntimeError("You cannot exceed 14 character images.")

        # remove all of the Nones
        query = {k: v for k, v in data.items() if v != None}

        prompt += repr(query)

        # Write the prompt from json using gemini text gen
        response = GEMINI_CLIENT.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )

        generated_prompt = response.text

        print(f"generated prompt: {generated_prompt}")

        # Generate an image with it

        response = GEMINI_CLIENT.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=[generated_prompt, *character_images],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            )
        )

        panels_path = project_static_path.joinpath(Path("panels", self.id))
        panels_path.mkdir(exist_ok=True)

        for part in response.candidates[0].content.parts:
            if part.inline_data:
                # Save the resulting image
                # number based on number of images in the folder
                img_number = len(panels_path.iterdir()) + 1
                (panels_path / f"{img_number}.png").write_bytes(part.inline_data.data)
    
