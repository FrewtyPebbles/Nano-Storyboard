from fastapi import FastAPI

from src.shared import Base, SQL_ENGINE
from src.project.storyboard_project import StoryBoardProject  # noqa: F401
from src.project.character import Character  # noqa: F401
from src.project.panel import Panel  # noqa: F401

Base.metadata.create_all(SQL_ENGINE)

APP = FastAPI()

@APP.get("/projects")
def list_projects():
    return []