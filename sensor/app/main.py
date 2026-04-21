import json
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
import redis
import asyncio
from googleapiclient.discovery import build
from app.models import IngestedEvent
from app.processors.normalizer import normalize_event
from app.clients.backend_client import forward_to_backend
from app.config import REDIS_URL
from app.utils.gmail_auth import get_gmail_service
from app.parsers.slack_parser import parse_slack_message
from app.parsers.gmail_parser import parse_gmail_message

app = FastAPI(title="Zenius Sensor Layer")
cache = redis.from_url(REDIS_URL, decode_responses=True)

@app.post("/webhook/slack")
async def slack_webhook(request: Request):
    payload = await request.json()
    
    if "challenge" in payload:
        return {"challenge": payload["challenge"]}
    
    # 1. Use the Parser!
    parsed = parse_slack_message(payload)
    
    # 2. Redis Guard (Deduplication)
    msg_id = payload.get("event", {}).get("client_msg_id")
    if msg_id and not cache.set(f"seen:{msg_id}", "true", ex=86400, nx=True):
        print(f"Duplicate Slack detected: {msg_id}")
        return {"status": "already_processed"}

    # 3. Normalize
    processed = normalize_event(parsed["source"], parsed["user_id"], parsed["text"]) 
    
    """
    # --- ADD THIS DEBUG BLOCK ---
    safe_payload = jsonable_encoder(processed)
    print(f"[SLACK] Forwarding to Backend: {json.dumps(safe_payload, indent=2)}")
    # ----------------------------
    """

    print(f"[SLACK] Ingesting message from: {parsed['user_id']}")

    # 4. Forward and Check Response
    response = await forward_to_backend(processed)
    print(f"Backend Response: {response}") # See if you get a 200 or 422
    
    return {"status": "ingested", "event_id": processed.event_id}

async def check_gmail_periodically():
    # Setup Google Service
    creds = get_gmail_service()
    service = build('gmail', 'v1', credentials=creds)
    
    while True:
        try:
            results = service.users().messages().list(userId='me', q='is:unread').execute()
            messages = results.get('messages', [])

            if messages:
                print(f"Found {len(messages)} unread emails. Filtering...")

            for msg in messages:
                # 1. Deduplication (Safety First)
                if not cache.set(f"seen:gmail:{msg['id']}", "true", ex=86400, nx=True):
                    continue

                # 2. Get and Parse
                full_msg = service.users().messages().get(userId='me', id=msg['id']).execute()
                parsed = parse_gmail_message(full_msg)
                
                # 🛡️ THE TRASH FILTER (Fixed & Active)
                blacklist = ["linkedin", "dominos", "shopee", "facebook", "canva", "newsletter"]
                if any(junk in parsed["user_id"].lower() for junk in blacklist):
                    print(f"⏭️  Skipping junk: {parsed['user_id']}")
                    # IMPORTANT: Mark as read so we don't fetch it again
                    service.users().messages().batchModify(
                        userId='me', body={'ids': [msg['id']], 'removeLabelIds': ['UNREAD']}
                    ).execute()
                    continue

                # 3. Normalize & Forward
                processed = normalize_event(parsed["source"], parsed["user_id"], parsed["text"])
                
                """
                # --- DEBUG BLOCK ---

                # Use jsonable_encoder to safely handle the datetime/timestamp
                safe_payload = jsonable_encoder(processed)
                print(f"[GMAIL] Cleaned Payload: {json.dumps(safe_payload, indent=2)}")
                # ----------------------------
                """

                # 4. Forward and Check Response
                response = await forward_to_backend(processed)
                if response and (response.get("id") or response.get("message")):
                    print(f"[GMAIL] Ingested: {parsed['user_id']} (ID: {response.get('id')})")
                    
                    # Mark as read ONLY if successfully sent to Nicol
                    service.users().messages().batchModify(
                        userId='me', body={'ids': [msg['id']], 'removeLabelIds': ['UNREAD']}
                    ).execute()
                else:
                    print(f"Backend delay/error for: {parsed['user_id']}")

        except Exception as e:
            print(f"Gmail Polling Error: {e}")

        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_gmail_periodically())