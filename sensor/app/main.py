# FastAPI entrypoint & routes
import redis
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.encoders import jsonable_encoder
from app.models import IngestedEvent
from app.processors.normalizer import normalize_event
from app.clients.backend_client import forward_to_backend
from app.config import REDIS_URL # <-- Make sure this is in your config.py

app = FastAPI(title="Zenius Sensor Layer")

# Initialize the Redis connection
# decode_responses=True means we get back strings, not weird binary data
cache = redis.from_url(REDIS_URL, decode_responses=True)

@app.post("/webhook/slack")
async def slack_webhook(request: Request):
    payload = await request.json()
    
    # 1. Slack URL Verification (Necessary for Ngrok setup later)
    if "challenge" in payload:
        return {"challenge": payload["challenge"]}
    
    event = payload.get("event", {})
    
    # 2. THE REDIS GUARD: Slack's unique message ID
    msg_id = event.get("client_msg_id")
    
    if msg_id:
        # We try to "set" this key. 
        # nx=True: Only works if the key DOESN'T exist (New Message)
        # ex=86400: The key expires in 24 hours (No need to store forever)
        is_new = cache.set(f"seen:{msg_id}", "true", ex=86400, nx=True)
        
        if not is_new:
            print(f"♻️ Duplicate detected! Skipping Slack ID: {msg_id}")
            return {"status": "already_processed"}

    # 3. Proceed as normal
    user_id = event.get("user", "unknown")
    text = event.get("text", "")
    
    # Note: Using 'content' if you changed the parameter name in normalize.py
    processed = normalize_event("slack", user_id, text) 
    await forward_to_backend(jsonable_encoder(processed))
    
    return {"status": "ingested", "event_id": processed.event_id}

# ... keep the rest of your routes (Gmail/Health) ...
@app.post("/webhook/gmail")
async def gmail_webhook(request: Request):
    payload = await request.json()
    user_id = payload.get("from_email", "unknown")
    text = payload.get("body", "")
    
    processed = normalize_event("gmail", user_id, text)
    await forward_to_backend(processed)
    return {"status": "ingested", "event_id": processed.event_id}

@app.get("/health")
def health():
    return {"status": "sensor_layer_active"}