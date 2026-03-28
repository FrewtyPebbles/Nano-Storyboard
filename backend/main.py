from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session


from src.pydantic_models import CharacterValidator, PanelValidator, StoryBoardProjectValidator
from src.shared import Base, SQL_ENGINE, SESSION_PRODUCER
from src.project.storyboard_project import StoryBoardProject
from src.project.character import Character
from src.project.panel import Panel

Base.metadata.create_all(SQL_ENGINE)

APP = FastAPI()

@APP.get("/project")
def list_projects():
    with SESSION_PRODUCER() as ses:
        projects = StoryBoardProject.list_projects(ses)
        return [StoryBoardProjectValidator.model_validate(project) for project in projects]

@APP.post("/project")
def create_project(project:StoryBoardProjectValidator):
    with SESSION_PRODUCER() as ses:
        return StoryBoardProjectValidator.model_validate(StoryBoardProject.create(
            ses,
            project.title,
            project.genre,
            project.premise,
            project.visual_tone,
        ))

@APP.get("/project/{project_id}/panel")
def get_panels(project_id:int):
    with SESSION_PRODUCER() as ses:
        project:StoryBoardProject | None = None
        project_sequence = StoryBoardProject.get(ses, where_clause=(StoryBoardProject.id==project_id))
        if len(project_sequence):
            project = project_sequence[0]
        
        # Guard
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story Board Project not found."
            )
        panels = project.get_panels(ses)
        return [PanelValidator.model_validate(panel) for panel in panels]

@APP.post("/project/{project_id}/character")
def create_character(project_id:int, character_json:CharacterValidator):
    with SESSION_PRODUCER() as ses:
        character = Character.create(ses,
            project_id,
            character_json.name,
            character_json.age,
            character_json.gender,
            character_json.physical_description,
            character_json.back_story,
        )

        character.generate()

        return CharacterValidator.model_validate(character)

@APP.post("/project/{project_id}/panel")
def create_panel(project_id:int, panel_json:PanelValidator):
    with SESSION_PRODUCER() as ses:
        panel = Panel.create(ses, 
            panel_json.sequence,
            project_id,
            panel_json.camera_shot,
            panel_json.character_ids,
            panel_json.location,
            panel_json.time,
            panel_json.action,
            panel_json.dialogue,
            panel_json.caption,
            panel_json.image
        )

        panel.generate()

        
        
