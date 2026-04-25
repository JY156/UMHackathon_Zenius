from unicodedata import category

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
    """
    Two-Step Flow:
    1. POST to /api/inputs → Save email to Firestore (fast, reliable)
    2. POST to /api/agents/process-input → Trigger AI processing (may be slower)
    
    Redis retry queue is used for transient failures in EITHER step.
    """
    # ✅ Parse config URLs
    # BACKEND_API_URL should be base URL like "http://localhost:5000/api"
    base_url = BACKEND_API_URL.rstrip('/')
    ingest_url = f"{base_url}/inputs"
    process_url = f"{base_url}/agents/process-input"
    
    r = await redis.from_url(REDIS_URL)

    # ✅ Prepare JSON payload (matches inputRoutes.js schema)
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
            # ─────────────────────────────────────
            # ✅ STEP 1: INGEST (inputRoutes.js)
            # ─────────────────────────────────────
            print(f"📨 [Step 1/2] Ingesting: {payload.get('subject')}")
            
            ingest_resp = await client.post(
                ingest_url,
                json=payload,
                headers=headers,
                timeout=15.0  # Short timeout for fast ingestion
            )

            # Handle ingest errors
            if ingest_resp.status_code in [500, 502, 503, 504]:
                print(f"⚠️ Ingest server error {ingest_resp.status_code}. Queuing for retry...")
                await r.rpush("zenius_retry_queue", json.dumps({
                    "event": get_safe_event_for_redis(event),
                    "step": "ingest",
                    "reason": f"http_{ingest_resp.status_code}"
                }))
                return {"status": "queued", "step": "ingest"}

            if ingest_resp.status_code == 404:
                print("❌ 404 Error: Ingest endpoint not found. Check BACKEND_API_URL.")
                return {"status": "error", "reason": "ingest_404"}

            if ingest_resp.status_code == 400:
                print(f"❌ 400 Error: Ingest schema mismatch: {ingest_resp.text}")
                return {"status": "error", "reason": "ingest_bad_request"}

            ingest_resp.raise_for_status()
            ingest_result = ingest_resp.json()
            input_id = ingest_result.get("id")
            
            if not input_id:
                print(f"❌ Ingest succeeded but no inputId returned: {ingest_result}")
                return {"status": "error", "reason": "no_input_id"}
            
            print(f"✅ [Step 1/2] Ingested: inputId = {input_id}")

            # ─────────────────────────────────────
            # ✅ STEP 2: PROCESS WITH AI (agentRoutes.js)
            # ─────────────────────────────────────
            print(f"🤖 [Step 2/2] Processing with AI: {input_id}")
            
            process_payload = {"inputId": input_id}
            
            process_resp = await client.post(
                process_url,
                json=process_payload,
                headers=headers,
                timeout=45.0  # Longer timeout for AI processing
            )

            # Handle process errors - queue for retry if transient
            if process_resp.status_code in [500, 502, 503, 504]:
                print(f"⚠️ AI processing server error {process_resp.status_code}. Queuing for retry...")
                await r.rpush("zenius_retry_queue", json.dumps({
                    "event": get_safe_event_for_redis(event),
                    "step": "process",
                    "inputId": input_id,
                    "reason": f"http_{process_resp.status_code}"
                }))
                # Still return success for ingest - AI can retry later
                return {"status": "ingested_pending_ai", "inputId": input_id}

            if process_resp.status_code == 404:
                print("❌ 404 Error: AI process endpoint not found. Check route mounting.")
                return {"status": "error", "reason": "process_404"}

            if process_resp.status_code == 400:
                print(f"❌ 400 Error: AI process schema mismatch: {process_resp.text}")
                return {"status": "error", "reason": "process_bad_request"}

            process_resp.raise_for_status()
            process_result = process_resp.json()
            
            # ✅ FIX: Parse nested structure correctly
            result_data = process_result.get("result", {})
            inner_result = result_data.get("result", {})

            category = result_data.get("category", "unknown")
            action = inner_result.get("status") or inner_result.get("action") or "unknown"

            print(f"✅ [Step 2/2] AI Processed: category={category}, action={action}")
            
            return {
                "status": "success",
                "inputId": input_id,
                "category": category,
                "action": action,
                "taskId": inner_result.get("taskId"),  # Useful for debugging
                "assignedTo": inner_result.get("assignedTo", {}).get("name") if inner_result.get("assignedTo") else None
            }

        except httpx.ConnectError as e:
            print(f"📡 Network connect error: {str(e)}. Queuing for retry...")
            await r.rpush("zenius_retry_queue", json.dumps({
                "event": get_safe_event_for_redis(event),
                "reason": "network_connect"
            }))
            return {"status": "queued", "reason": "network_connect"}
            
        except httpx.TimeoutException as e:
            print(f"⏱️  Request timed out: {str(e)}. Queuing for retry...")
            await r.rpush("zenius_retry_queue", json.dumps({
                "event": get_safe_event_for_redis(event),
                "reason": "network_timeout"
            }))
            return {"status": "queued", "reason": "network_timeout"}
            
        except Exception as e:
            print(f"❌ Unexpected error: {type(e).__name__}: {str(e)}")
            # Only queue if it might be transient
            if "connection" in str(e).lower() or "timeout" in str(e).lower():
                await r.rpush("zenius_retry_queue", json.dumps({
                    "event": get_safe_event_for_redis(event),
                    "reason": f"unexpected_{type(e).__name__}"
                }))
                return {"status": "queued", "reason": "unexpected_error"}
            return {"status": "error", "reason": f"{type(e).__name__}: {str(e)}"}
            
        finally:
            await r.close()