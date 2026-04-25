from fastapi import FastAPI
import redis
import asyncio
from datetime import datetime # <--- ADD THIS
from googleapiclient.discovery import build

from app.models import IngestedEvent
# from app.processors.normalizer import normalize_event # You can remove this if event_data handles it
from app.clients.backend_client import forward_to_backend
from app.config import REDIS_URL
from app.utils.gmail_auth import get_gmail_service
from app.parsers.gmail_parser import parse_gmail_message
# from app.utils.email_sender import send_reassignment_email # Ensure this is imported!

app = FastAPI(title="Zenius Sensor Layer")
cache = redis.from_url(REDIS_URL, decode_responses=True)

async def check_gmail_periodically():
    creds = get_gmail_service()
    service = build('gmail', 'v1', credentials=creds)
    
    while True:
        try:
            results = service.users().messages().list(userId='me', q='is:unread').execute()
            messages = results.get('messages', [])

            if messages:
                print(f"Found {len(messages)} unread emails.")

            for msg in messages:
                # 1. Deduplication
                if not cache.set(f"seen:gmail:{msg['id']}", "true", ex=86400, nx=True):
                    continue

                # 2. Get and Parse
                full_msg = service.users().messages().get(userId='me', id=msg['id']).execute()
                parsed = parse_gmail_message(service, full_msg)
                
                # Trash Filter
                blacklist = ["linkedin", "dominos", "shopee", "facebook", "canva", "newsletter"]
                if any(junk in parsed["user_id"].lower() for junk in blacklist):
                    service.users().messages().batchModify(
                        userId='me', body={'ids': [msg['id']], 'removeLabelIds': ['UNREAD']}
                    ).execute()
                    continue

                # 3. Create the IngestedEvent
                event_data = IngestedEvent(
                    event_id=msg['id'],
                    source="gmail",
                    user_id=parsed["user_id"],
                    subject=parsed.get("subject", "No Subject"),
                    channel_or_thread=parsed.get("thread_id"),
                    content=parsed.get("raw_body", ""),
                    cleaned_text=parsed.get("cleaned_body", ""),
                    timestamp=datetime.fromtimestamp(int(parsed.get("timestamp", 0))/1000),
                    # ✅ Pydantic automatically converts List[dict] → List[Attachment]
                    attachments=parsed.get("attachments", []) 
                )
                
                # 4. Forward to Backend
                response = await forward_to_backend(event_data)

                # ✅ FIX: Check for correct response keys from forward_to_backend
                if response and response.get("status") in ["success", "ingested_pending_ai", "queued"]:
                    print(f"[GMAIL] Ingested: {parsed['user_id']} | Status: {response.get('status')}")

                    # Task 4: REASSIGNMENT CHECK
                    if response.get("action") == "REASSIGN":
                        print(f"⚠️ Reassignment triggered for task")
                        # await send_reassignment_email(...)  # Uncomment when ready

                    # ✅ Mark as read - NOW THIS RUNS!
                    try:
                        service.users().messages().batchModify(
                            userId='me', 
                            body={'ids': [msg['id']], 'removeLabelIds': ['UNREAD']}
                        ).execute()
                        print(f"✅ Marked message {msg['id']} as read")
                    except Exception as e:
                        print(f"⚠️ Failed to mark as read: {e}")
                        # Don't fail the whole flow if this fails

                elif response and response.get("status") == "error":
                    print(f"❌ Backend error: {response.get('reason')}")

        except Exception as e:
            import traceback
            print(f"🛑 CRITICAL ERROR in Sensor: {e}")
            traceback.print_exc()

        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_gmail_periodically())