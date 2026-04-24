import httpx
import json
import redis.asyncio as redis
from fastapi.encoders import jsonable_encoder
from app.config import BACKEND_API_URL, BACKEND_API_KEY, REDIS_URL
from app.models import IngestedEvent

def get_safe_event_for_redis(event: IngestedEvent):
    """Now completely safe: .data is a base64 string, not binary."""
    return jsonable_encoder(event.model_dump())

async def forward_to_backend(event: IngestedEvent):
    url = BACKEND_API_URL
    r = redis.from_url(REDIS_URL)

    # ✅ Prepare JSON payload (attachments stay as base64 strings)
    payload = {
        "source": event.source,
        "content": event.cleaned_text,
        "subject": getattr(event, 'subject', 'No Subject'),
        "attachments": [att.model_dump() for att in event.attachments],
        "thread_id": getattr(event, 'channel_or_thread', None),
        "user_id": getattr(event, 'user_id', None),
        "timestamp": event.timestamp.isoformat() if getattr(event, 'timestamp', None) else None
    }

    headers = {
        "Authorization": f"Bearer {BACKEND_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                url,
                json=payload,  # ✅ Sends as application/json
                headers=headers,
                timeout=30.0   # Increased for base64 payload size
            )

            if resp.status_code in [500, 502, 503, 504]:
                print(f"⚠️ Server error {resp.status_code}. Queuing for retry...")
                await r.rpush("zenius_retry_queue", json.dumps({
                    "event": get_safe_event_for_redis(event),
                    "reason": f"http_{resp.status_code}"
                }))
                return {"status": "queued"}

            if resp.status_code == 404:
                print("❌ 404 Error: The Backend API URL is incorrect.")
                return {"status": "error", "reason": "wrong_url"}

            if resp.status_code == 400:
                print(f"❌ 400 Error: Schema mismatch: {resp.text}")
                return {"status": "error", "reason": "bad_request"}

            resp.raise_for_status()
            return resp.json()

        except (httpx.ConnectError, httpx.TimeoutException) as e:
            print(f"📡 Network issue: {str(e)}. Queuing for retry...")
            await r.rpush("zenius_retry_queue", json.dumps({
                "event": get_safe_event_for_redis(event),
                "reason": "network_timeout"
            }))
            return {"status": "queued"}
        finally:
            await r.close()