import base64
from bs4 import BeautifulSoup

def clean_html(raw_html):
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    # This removes scripts and styles from the text
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
    return soup.get_text(separator=' ').strip()

def parse_gmail_message(message_raw: dict):
    payload = message_raw.get('payload', {})
    headers = payload.get('headers', [])
    
    sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
    
    parts = payload.get('parts', [])
    body = ""
    if not parts:
        body = payload.get('body', {}).get('data', "")
    else:
        # A more robust way to find the text part
        for part in parts:
            if part['mimeType'] == 'text/plain' or part['mimeType'] == 'text/html':
                body = part.get('body', {}).get('data', "")
                break
    
    decoded_body = base64.urlsafe_b64decode(body).decode('utf-8') if body else ""
    
    # --- THE FIX: CALL CLEAN_HTML HERE ---
    cleaned_body = clean_html(decoded_body)
    # -------------------------------------

    return {
        "text": f"{subject}: {cleaned_body}",
        "user_id": sender,
        "timestamp": message_raw.get('internalDate'),
        "source": "gmail"
    }