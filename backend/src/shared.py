from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from google import genai
from dotenv import load_dotenv

import os

load_dotenv()

GEMINI_CLIENT = genai.Client(api_key=os.getenv("GEMINI_KEY"))
SQL_ENGINE = create_engine("sqlite:///data/database.db", echo=True)

SESSION_PRODUCER = sessionmaker(bind=SQL_ENGINE)

class Base(DeclarativeBase):
    pass



