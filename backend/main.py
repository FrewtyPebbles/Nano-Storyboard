from fastapi import FastAPI

APP = FastAPI()

@APP.get("/projects")
def list_projects():
    return []

@APP.get("/projects")
def list_projects():
    return []