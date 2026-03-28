from pydantic import BaseModel, ConfigDict, Field
from typing import Optional 
from src.project.character import Gender
from src.project.panel import CameraShot

class CharacterValidator(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name:str
    age:int = Field(gt=0)
    gender:Gender
    physical_description:str
    back_story:Optional[str] = None
    image:Optional[str] = None

class PhysicalCharacteristicsValidator(BaseModel):
    characteristics: str

class PanelValidator(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    sequence:int
    camera_shot:Optional[CameraShot] = None
    location:Optional[str] = None
    time:Optional[str] = None
    action:Optional[str] = None
    dialogue:Optional[str] = None
    caption:Optional[str] = None
    image:Optional[str] = None
    character_ids:Optional[list[int]] = []

class StoryBoardProjectValidator(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title:str
    genre:Optional[str] = None
    premise:Optional[str] = None
    visual_tone:Optional[str] = None
    characters:Optional[list[CharacterValidator]] = []
    panels:Optional[list[PanelValidator]] = []
