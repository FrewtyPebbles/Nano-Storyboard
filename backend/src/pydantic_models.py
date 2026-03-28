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
    back_story:str
    image:str

class PanelValidator(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    sequence:int
    camera_shot:Optional[CameraShot]
    location:Optional[str]
    time:Optional[str]
    action:Optional[str]
    dialogue:Optional[str]
    caption:Optional[str]
    image:Optional[str]

class StoryBoardProjectValidator(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title:str
    genre:Optional[str]
    premise:Optional[str]
    visual_tone:Optional[str]
    characters:Optional[list[CharacterValidator]] = []
    panels:Optional[list[PanelValidator]] = []
