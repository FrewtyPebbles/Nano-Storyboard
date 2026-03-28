from fastapi import FastAPI
from sqlalchemy.orm import Session


from src.shared import Base, SQL_ENGINE
from src.project.storyboard_project import StoryBoardProject, create_project  # noqa: F401
from src.project.character import Character  # noqa: F401
from src.project.panel import Panel  # noqa: F401

Base.metadata.create_all(SQL_ENGINE)

APP = FastAPI()

@APP.get("/project")
def list_projects():
    return []

@APP.get("/project/{id}/panel")
def get_panels():
    return []

@APP.post("/project/panel")
def create_panel():
    return []
