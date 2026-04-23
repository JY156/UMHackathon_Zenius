import base64
from bs4 import BeautifulSoup

def clean_html(raw_html):
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
    return soup.get_text(separator=' ').strip()

def parse_gmail_message(message_raw: dict):
    payload = message_raw.get('payload', {})
    headers = payload.get('headers', [])
    
    # Get metadata for threading and sender
    sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
    thread_id = message_raw.get('threadId') # CRITICAL for Task 3 (Threading)
    
    parts = payload.get('parts', [])
    body = ""
    attachments = [] # Task 2: Initialize file list

    # --- THE FIX: UNIVERSAL PART HANDLER ---
    def walk_parts(all_parts):
        nonlocal body
        for part in all_parts:
            filename = part.get('filename')
            mime_type = part.get('mimeType')
            
            # If it has a filename, it's a file (Task 2 & 3)
            if filename:
                attachments.append({
                    "filename": filename,
                    "mimeType": mime_type,
                    "attachmentId": part.get('body', {}).get('attachmentId'),
                    "size": part.get('body', {}).get('size')
                })
            
            # If it's text and we haven't found a body yet
            elif mime_type in ['text/plain', 'text/html'] and not body:
                data = part.get('body', {}).get('data', "")
                if data:
                    body = data
            
            # Recurse if there are sub-parts (some emails are nested)
            if 'parts' in part:
                walk_parts(part['parts'])

    if not parts:
        body = payload.get('body', {}).get('data', "")
    else:
        walk_parts(parts)
    # ---------------------------------------

    decoded_body = base64.urlsafe_b64decode(body).decode('utf-8') if body else ""
    cleaned_body = clean_html(decoded_body)

    return {
        "thread_id": thread_id,           # Task 3: Keeps conversation together
        "subject": subject,
        "raw_body": decoded_body,      # <--- Added this for main.py
        "cleaned_body": cleaned_body,
        "user_id": sender,
        "timestamp": message_raw.get('internalDate'),
        "source": "gmail",
        "attachments": attachments        # Task 2: All files (PDF, Sheets, JPG, etc.)
    }