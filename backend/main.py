from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session


from backend.src.pydantic_models import PanelValidator, StoryBoardProjectValidator
from src.shared import Base, SQL_ENGINE, SESSION_PRODUCER
from src.project.storyboard_project import StoryBoardProject, create_project  # noqa: F401
from src.project.character import Character  # noqa: F401
from src.project.panel import Panel  # noqa: F401

Base.metadata.create_all(SQL_ENGINE)

APP = FastAPI()

@APP.get("/project")
def list_projects():
    with SESSION_PRODUCER() as ses:
        projects = StoryBoardProject.list(ses)
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
        project_sequence = StoryBoardProject.get(ses, where_clause=(StoryBoardProject.id==id))
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

@APP.post("/project/{project_id}/panel")
def create_panel(project_id:int, panel:PanelValidator):
    with SESSION_PRODUCER() as ses:
        panel = Panel.create(ses, 
            panel.sequence,
            project_id,
            panel.camera_shot,
            panel.location,
            panel.time,
            panel.action,
            panel.dialogue,
            panel.caption,
            panel.image
        )

        
        
