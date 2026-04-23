# Forwards validated data to Express

import httpx
import json
from app.config import BACKEND_API_URL, BACKEND_API_KEY, REDIS_URL
from app.models import IngestedEvent
import redis.asyncio as redis
from fastapi.encoders import jsonable_encoder

async def forward_to_backend(event: IngestedEvent):
    url = BACKEND_API_URL
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": BACKEND_API_KEY  # Standard way to pass your secret key
    }
    # Lazy-init Redis connection (or init in config.py)
    r = redis.from_url(REDIS_URL)
    
    async with httpx.AsyncClient() as client:
        try:
            payload = jsonable_encoder(event)
            resp = await client.post(
                url,
                json=payload,  # <--- Use the prepared payload
                headers=headers,
                timeout=10  # Set a reasonable timeout for backend response
            )
            
            # Handle Express-specific errors
            if resp.status_code == 503:
                # Express is overloaded/down → queue for retry
                await r.rpush("zenius_retry_queue", json.dumps({
                    "event": jsonable_encoder(event),
                    "retry_reason": "backend_unavailable",
                    "timestamp": event.timestamp.isoformat() if event.timestamp else None
                }))
                return {"status": "queued_retry", "reason": "backend_down"}
            
            if resp.status_code == 400:
                # Bad request → log & skip (don't retry bad data)
                # print(f"Validation error: {resp.text}")
                return {"status": "dropped", "reason": "invalid_schema"}
                
            resp.raise_for_status()  # Only raise for unexpected errors
            return resp.json()
            
        except httpx.ConnectError:
            # Express server not reachable
            await r.rpush("zenius_retry_queue", json.dumps({
                "event": jsonable_encoder(event),
                "retry_reason": "connection_failed",
                "timestamp": event.timestamp.isoformat() if event.timestamp else None
            }))
            return {"status": "queued_retry", "reason": "no_connection"}
            
        except httpx.TimeoutException:
            # Express took too long
            await r.rpush("zenius_retry_queue", json.dumps({
                "event": jsonable_encoder(event),
                "retry_reason": "timeout",
                "timestamp": event.timestamp.isoformat() if event.timestamp else None
            }))
            return {"status": "queued_retry", "reason": "timeout"}
            
        except httpx.HTTPStatusError as e:
            # Unexpected 4xx/5xx (not handled above)
            # print(f"Backend error {e.response.status_code}: {e.response.text}")
            return {"status": "error", "error": str(e)}
            
        finally:
            await r.close()  # Clean up Redis connection