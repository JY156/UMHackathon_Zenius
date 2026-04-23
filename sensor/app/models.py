from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class IngestedEvent(BaseModel):
    event_id: str
    source: str
    user_id: str
    channel_or_thread: Optional[str] = None
    content: str
    cleaned_text: str
    timestamp: datetime
    
    # detect files
    # sdding a specific field for attachments makes it easier for AI to "see" the files immediately
    attachments: List[Dict] = []
    
    keywords_detected: List[str] = []
    metadata: dict = Field(default_factory=dict)  # priority, skills, deadlines
    conflict_flag: bool = False
    conflicting_sources: List[str] = []
    feedback_type: Optional[str] = None  # "decline", "overloaded", etc.
    requires_clarification: bool = False