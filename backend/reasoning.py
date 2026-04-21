import json
import firebase_admin
from firebase_admin import credentials, firestore

# Setup Firebase
cred = credentials.Certificate("backend/service-account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_live_context():
    # Fetch real-time data for your GLM reasoning
    members = db.collection('users').stream()
    tasks = db.collection('tasks').stream()
    
    team_load_map = [m.to_dict() for m in members]
    orphaned_tasks = [t.to_dict() for t in tasks]
    
    return team_load_map, orphaned_tasks

def run_impact_analysis(absence_trigger_text, team_load_data, orphaned_tasks):
    '''
    This is your core 'Impact Analysis' script.
    It takes the noise (text), the team state (load map), and the tasks to be moved.
    '''
    
    # SYSTEM INSTRUCTION: This is the 'Brain' of Task 2
    system_instruction = (
        'You are the Zenius Orchestrator. Context: A team member is absent. '
        'Your goal: Reassign their tasks based on logic. '
        'CONSTRAINTS: '
        '1. Match task \'skills\' to member \'skills\'. '
        '2. Prioritize members with the lowest \'current_load\'. '
        '3. Avoid members with a \'sentiment_score\' below 0.3 (Burnout Risk). '
        '4. Output ONLY valid JSON.'
    )

    # CONTEXT PREPARATION: Combine all data for the AI
    user_prompt = f'''
    ABSENCE TRIGGER: {absence_trigger_text}
    
    ORPHANED TASKS: {json.dumps(orphaned_tasks)}
    
    TEAM LOAD MAP: {json.dumps(team_load_data)}
    
    Please provide the reassignment commands in JSON format.
    '''

    # For now, since API is not available, return a mock response
    # When API key is ready, uncomment the following lines and install openai
    # from openai import OpenAI
    # client = OpenAI(base_url='https://api.z.ai/api/paas/v4', api_key='your-api-key-here')
    '''
    try:
        # 2. REASONING: Call the GLM-5 model
        response = client.chat.completions.create(
            model='glm-5', # The mandatory model for UMHackathon 2026
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.2, # Lower temperature for stable, logical output
            response_format={'type': 'json_object'} # Forces JSON output
        )

        # 3. OUTPUT: Extract the structured JSON for Task 3
        reasoning_result = response.choices[0].message.content
        return json.loads(reasoning_result)

    except Exception as e:
        return {'error': str(e), 'status': 'Fallback triggered'}
    '''

    # Mock response for testing
    return {
        'suggestedTid': 'TASK-101',
        'fromUid': 'absent_user',
        'toUid': 'user_01',
        'reasoning': 'Best match based on skills and low load.'
    }

# --- EXAMPLE DATA FOR TESTING (You can run this today!) ---
mock_noise = 'I am feeling very unwell and need to take emergency leave today.'
mock_tasks = [{'tid': 'TASK-101', 'skills': ['Python', 'API']}]
mock_team = [
    {'uid': 'user_01', 'name': 'Sarah', 'skills': ['Python'], 'current_load': 20, 'sentiment_score': 0.9},
    {'uid': 'user_02', 'name': 'John', 'skills': ['Design'], 'current_load': 10, 'sentiment_score': 0.2}
]

# To run the test, uncomment the following lines:
# result = run_impact_analysis(mock_noise, mock_team, mock_tasks)
# print(result)


def save_suggestion(suggestion_data):
    # This pushes your AI decision to the 'approvals' collection
    # so Task 3 can see it and update Jira
    db.collection('approvals').add({
        **suggestion_data,
        'status': 'pending',
        'timestamp': firestore.SERVER_TIMESTAMP
    })
    print("Decision saved to Approvals Collection.")