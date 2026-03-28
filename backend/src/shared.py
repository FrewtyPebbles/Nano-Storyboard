from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from google import genai
from dotenv import load_dotenv

import os

load_dotenv()

GEMINI_CLIENT = genai.Client(api_key=os.getenv("GEMINI_KEY"))

class Base(DeclarativeBase):
    pass

SQL_ENGINE = create_engine("sqlite:///database.db", echo=True)

