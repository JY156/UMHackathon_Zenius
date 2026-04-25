# Env vars & settings

import os
from dotenv import load_dotenv

load_dotenv()

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")
GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "zenius_secret_2026")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")