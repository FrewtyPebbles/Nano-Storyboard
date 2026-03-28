from fastapi import FastAPI, HTTPException, status
from sqlalchemy.orm import Session


from src.pydantic_models import CharacterValidator, PanelValidator, PhysicalCharacteristicsValidator, StoryBoardProjectValidator
from src.shared import Base, SQL_ENGINE, SESSION_PRODUCER
from src.project.storyboard_project import StoryBoardProject
from src.project.character import Character
from src.project.panel import Panel
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(SQL_ENGINE)

APP = FastAPI()

origins = [
    "http://localhost:5173",  # Common for Vite
]

APP.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],               # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],               # Allow all headers
)

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

@APP.put("/project/{project_id}/character/{character_id}")
def update_character(project_id:int, character_id:int, character_json:CharacterValidator):
    with SESSION_PRODUCER() as ses:
        character = Character.get(ses, character_id)

        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found."
            )

        updates = character_json.model_dump(exclude_unset=True, exclude={"image"})
        character.update(ses, **updates)

        return CharacterValidator.model_validate(character)

@APP.delete("/project/{project_id}/character/{character_id}")
def delete_character(project_id:int, character_id:int):
    with SESSION_PRODUCER() as ses:
        character = Character.get(ses, character_id)

        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found."
            )

        character.delete(ses)
        return {"detail": "Character deleted."}

@APP.patch("/project/{project_id}/character/{character_id}")
def edit_character(project_id:int, character_id:int, character_json:CharacterValidator):
    with SESSION_PRODUCER() as ses:
        character = Character.get(ses, character_id)

        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found."
            )

        updates = character_json.model_dump(exclude_unset=True, exclude={"image"})
        character.edit_character(ses, **updates)

        return CharacterValidator.model_validate(character)

@APP.patch("/project/{project_id}/character/{character_id}/physical")
def add_physical_characteristics(project_id:int, character_id:int, body:PhysicalCharacteristicsValidator):
    with SESSION_PRODUCER() as ses:
        character = Character.get(ses, character_id)

        if not character:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Character not found."
            )

        character.add_physical_characteristics(ses, body.characteristics)

        return CharacterValidator.model_validate(character)

@APP.put("/project/{project_id}/panel/{panel_id}")
def update_panel(project_id:int, panel_id:int, panel_json:PanelValidator):
    with SESSION_PRODUCER() as ses:
        panel = ses.get(Panel, panel_id)

        if not panel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Panel not found."
            )

        updates = panel_json.model_dump(exclude_unset=True, exclude={"image"})
        character_ids = updates.pop("character_ids", None)
        panel.update(ses, character_ids=character_ids, **updates)

        return PanelValidator.model_validate(panel)

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

        
        
