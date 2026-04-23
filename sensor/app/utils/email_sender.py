# app/utils/email_sender.py
import base64
from email.mime.text import MIMEText

async def send_reassignment_email(service, to, task_name, thread_id):
    """Sends an automated email notification within the same thread."""
    message_text = f"Hi, you have been reassigned to the task: {task_name}. Please check the Zenius dashboard for details."
    
    message = MIMEText(message_text)
    message['to'] = to
    message['subject'] = f"Reassignment: {task_name}"
    
    # Task 3 logic: Keeping it in the same thread
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    try:
        service.users().messages().send(
            userId='me',
            body={'raw': raw_message, 'threadId': thread_id}
        ).execute()
        print(f"Reassignment email sent to {to}")
    except Exception as e:
        print(f"Failed to send reassignment email: {e}")