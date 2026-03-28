from pydantic import BaseModel, Field
from typing import Optional 
from src.project.character import Gender
from src.project.panel import CameraShot

class CharacterValidator(BaseModel):
    name:str
    age:int = Field(gt=0)
    gender:Gender
    physical_description:str
    back_story:str
    image:str

class PanelValidator(BaseModel):
    sequence:int
    camera_shot:Optional[CameraShot]
    location:Optional[str]
    time:Optional[str]
    action:Optional[str]
    dialogue:Optional[str]
    caption:Optional[str]
    image:Optional[str]

class StoryBoardProjectValidator(BaseModel):
    title:str
    genre:Optional[str]
    premise:Optional[str]
    visual_tone:Optional[str]
    characters:list[CharacterValidator]
    panels:list[PanelValidator]
