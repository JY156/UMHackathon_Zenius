import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

def get_gmail_service():
    creds = None
    # 1. Load existing token if it exists
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # 2. If there are no valid credentials, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Token expired. Refreshing...")
            creds.refresh(Request())
        else:
            print("🔑 No valid token found. Starting new auth flow...")
            # This 'flow' must be created AND used within this specific block
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        # 3. Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
    return creds