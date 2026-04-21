# Pydantic schemas (strict, domain-aligned)

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IngestedEvent(BaseModel):
    event_id: str
    source: str  # "slack" | "gmail"
    user_id: str
    channel_or_thread: Optional[str] = None
    content: str
    cleaned_text: str
    timestamp: datetime
    keywords_detected: List[str] = []
    metadata: dict = Field(default_factory=dict)  # priority, skills, deadlines
    conflict_flag: bool = False
    conflicting_sources: List[str] = []
    feedback_type: Optional[str] = None  # "decline", "overloaded", etc.
    requires_clarification: bool = False