from sqlalchemy import create_engine
from google import genai
from dotenv import load_dotenv

import os

# This is where our gemini api global variable will go
load_dotenv()

GEMINI_CLIENT = genai.Client(api_key=os.getenv("GEMINI_KEY"))
SQL_ENGINE = create_engine("sqlite:///database.db", echo=True)