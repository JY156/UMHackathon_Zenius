# Cleans text, extracts metadata, detects conflicts

import re
from datetime import datetime
from app.utils.keywords import *
from app.models import IngestedEvent

def clean_text(raw: str) -> str:
    # Removes Slack/HTML formatting tags
    return re.sub(r'<[^>]+>', '', raw).strip()

def extract_metadata(text: str) -> dict:
    text_lower = text.lower()
    return {
        "priority_keywords": [k for k in PRIORITY_PATTERNS if k in text_lower],
        "skill_tags": [s for s in SKILL_TAGS if re.search(rf'\b{s}\b', text, re.IGNORECASE)],
        "deadline_mentions": re.findall(r"deadline[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})", text_lower)
    }

def detect_conflict(event: dict, external_state: dict = None) -> bool:
    # Simple rule-based pre-filter before AI analysis
    has_leave = any(k in event['cleaned_text'].lower() for k in TRIGGER_KEYWORDS)
    has_activity = external_state.get("recent_task_activity", False) if external_state else False
    return has_leave and has_activity

def normalize_event(source: str, user_id: str, content: str, external_state: dict = None) -> IngestedEvent:
    cleaned = clean_text(content) # Changed from raw_text
    keywords = [k for k in TRIGGER_KEYWORDS + FEEDBACK_KEYWORDS if k in cleaned.lower()]
    metadata = extract_metadata(cleaned)
    conflict = detect_conflict({"cleaned_text": cleaned}, external_state)
    
    feedback = None
    if any(k in cleaned.lower() for k in FEEDBACK_KEYWORDS):
        feedback = "reassignment_declined"
    
    # We pass 'content' directly to the IngestedEvent model
    return IngestedEvent(
        event_id=f"{source}_{user_id}_{int(datetime.now().timestamp())}",
        source=source,
        user_id=user_id,
        content=content, # This MUST match your model field name
        cleaned_text=cleaned,
        timestamp=datetime.now(),
        keywords_detected=keywords,
        metadata=metadata,
        conflict_flag=conflict,
        feedback_type=feedback,
        requires_clarification=conflict or not keywords
    )