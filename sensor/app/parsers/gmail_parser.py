import base64
import io
from bs4 import BeautifulSoup

# Try to import PDF libraries
try:
    from pypdf import PdfReader
    PDF_LIB = "pypdf"
except ImportError:
    try:
        import PyPDF2
        PDF_LIB = "PyPDF2"
    except ImportError:
        PDF_LIB = None

def clean_html(raw_html):
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
    return soup.get_text(separator=' ').strip()

def extract_pdf_text(base64_data: str) -> str:
    """Extract text from base64url-encoded PDF"""
    if PDF_LIB is None or not base64_data:
        return "[PDF text extraction not available]"
    
    try:
        # Decode base64url to bytes
        normalized = base64_data.replace('-', '+').replace('_', '/')
        padding = len(normalized) % 4
        if padding:
            normalized += '=' * (4 - padding)
        pdf_bytes = base64.b64decode(normalized)
        
        # Extract text using available library
        if PDF_LIB == "pypdf":
            reader = PdfReader(io.BytesIO(pdf_bytes))
        else:
            reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        
        # Extract from first 5 pages (enough for AI context)
        text_parts = []
        for page in reader.pages[:5]:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
        
        extracted = " ".join(text_parts)
        # Limit to 2000 chars for AI context
        return extracted[:2000] + "..." if len(extracted) > 2000 else extracted
        
    except Exception as e:
        print(f"⚠️ PDF extraction failed: {e}")
        return "[Could not extract PDF content]"

def parse_gmail_message(service, message_raw: dict):
    payload = message_raw.get('payload', {})
    headers = payload.get('headers', [])
    message_id = message_raw.get('id')

    def get_header_value(name):
        return next((h['value'] for h in headers if h['name'].lower() == name.lower()), None)
    
    sender = get_header_value('From') or "Unknown"
    subject = get_header_value('Subject') or "No Subject"
    thread_id = message_raw.get('threadId')

    parts = payload.get('parts', [])
    body = ""
    attachments = []

    def walk_parts(all_parts):
        nonlocal body
        for part in all_parts:
            filename = part.get('filename')  # ✅ filename defined HERE
            mime_type = part.get('mimeType')
            
            if filename:
                attach_id = part.get('body', {}).get('attachmentId')
                if attach_id:
                    attachment_meta = service.users().messages().attachments().get(
                        userId='me', messageId=message_id, id=attach_id
                    ).execute()
                    
                    base64_data = attachment_meta.get('data', '')
                    
                    # ✅ Extract text if PDF (inside the if filename block)
                    extracted_text = None
                    if mime_type == 'application/pdf':
                        extracted_text = extract_pdf_text(base64_data)
                        print(f"📄 PDF extracted: {len(extracted_text) if extracted_text else 0} chars")
                    
                    attachments.append({
                        "filename": filename,
                        "mimeType": mime_type,
                        "data": base64_data,
                        "size": part.get('body', {}).get('size'),
                        "attachmentId": attach_id,
                        "extracted_text": extracted_text  # ✅ NEW field
                    })
            
            elif mime_type in ['text/plain', 'text/html'] and not body:
                data = part.get('body', {}).get('data', "")
                if data:
                    body = data
            
            if 'parts' in part:
                walk_parts(part['parts'])

    if not parts:
        body = payload.get('body', {}).get('data', "")
    else:
        walk_parts(parts)

    decoded_body = base64.urlsafe_b64decode(body).decode('utf-8') if body else ""
    cleaned_body = clean_html(decoded_body)

    return {
        "thread_id": thread_id,
        "subject": subject,
        "raw_body": decoded_body,
        "cleaned_body": cleaned_body,
        "user_id": sender,
        "timestamp": message_raw.get("internalDate"),
        "source": "gmail",
        "attachments": attachments
    }