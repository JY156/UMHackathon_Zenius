from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Attachment(BaseModel):
    filename: str
    mimeType: str
    data: str  # Base64url-encoded string
    size: Optional[int] = None
    attachmentId: Optional[str] = None
    extracted_text: Optional[str] = None  # ✅ NEW: For PDF text

class IngestedEvent(BaseModel):
    event_id: str
    source: str
    user_id: str
    channel_or_thread: Optional[str] = None
    content: str
    cleaned_text: str
    timestamp: datetime
    
    attachments: List[Attachment] = Field(default_factory=list)
    
    keywords_detected: List[str] = []
    metadata: dict = Field(default_factory=dict)
    conflict_flag: bool = False
    conflicting_sources: List[str] = []
    feedback_type: Optional[str] = None
    requires_clarification: bool = False