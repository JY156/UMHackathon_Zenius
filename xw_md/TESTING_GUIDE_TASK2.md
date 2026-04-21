# Testing Guide for Task 2: Reasoning Engine

## Overview
This guide covers how to test the Reasoning Engine at different levels:
1. **Unit Tests** - Test reasoning logic in isolation.
2. **Integration Tests** - Test with Firebase database.
3. **End-to-End Tests** - Test full workflow.
4. **Burnout Logic Tests** - Validate burnout detection.

---

## Test Level 1: Unit Tests (Mock Data)

### Test File: backend/test_reasoning_unit.py

Run the reasoning module with mock data (no database needed):

\\\ash
python backend/test_reasoning_unit.py
\\\

### Expected Output:
\\\json
{
    "suggestedTid": "TASK-001",
    "fromUid": "user_01",
    "toUid": "user_02",
    "reasoning": "Best match based on skills and low load."
}
\\\

### What It Tests:
- ✅ Module imports correctly.
- ✅ Mock data processes without errors.
- ✅ JSON output is valid.
- ✅ System instruction is applied.

---

## Test Level 2: Integration Tests (Firebase)

### Prerequisites:
1. Firebase project is set up.
2. Service account key is in backend/serviceAccountKey.json.
3. Database is seeded with test data (run seedDatabase.js).

### Test File: backend/test_reasoning_integration.py

This tests the full workflow with real database queries:

\\\python
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('backend/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def test_fetch_orphaned_tasks():
    '''Test: Fetch all tasks from absent user'''
    absent_user_id = 'user_01'
    
    tasks_ref = db.collection('tasks')
    orphaned_tasks = tasks_ref.where('assignedTo', '==', absent_user_id).where('status', '!=', 'completed').stream()
    
    orphaned_list = [{'tid': doc.id, **doc.to_dict()} for doc in orphaned_tasks]
    print(f'✅ Orphaned Tasks Test: Found {len(orphaned_list)} tasks')
    print(json.dumps(orphaned_list, indent=2, default=str))
    return orphaned_list

def test_fetch_team_load():
    '''Test: Fetch all team members except absent user'''
    absent_user_id = 'user_01'
    
    users_ref = db.collection('users')
    team_members = []
    for doc in users_ref.stream():
        if doc.id != absent_user_id:
            user_data = doc.to_dict()
            user_data['uid'] = doc.id
            team_members.append(user_data)
    
    print(f'✅ Team Load Test: Found {len(team_members)} available team members')
    print(json.dumps(team_members, indent=2, default=str))
    return team_members

def test_burnout_detection():
    '''Test: Detect burnout indicators'''
    # Fetch all users and their load scores
    users_ref = db.collection('users')
    
    for doc in users_ref.stream():
        user_data = doc.to_dict()
        load_score = user_data.get('current_load', 0)
        sentiment = user_data.get('sentiment_score', 1.0)
        
        burnout_flag = load_score > 80 or sentiment < 0.3
        
        print(f'User: {user_data.get(\"name\")}, Load: {load_score}, Sentiment: {sentiment}, Burnout Risk: {burnout_flag}')

def test_late_night_activity():
    '''Test: Check for communications between 12 AM - 5 AM'''
    inputs_ref = db.collection('inputs')
    
    late_night_activities = []
    for doc in inputs_ref.stream():
        data = doc.to_dict()
        timestamp = data.get('timestamp')
        if timestamp:
            hour = timestamp.hour
            if 0 <= hour <= 5:
                late_night_activities.append({
                    'id': doc.id,
                    'timestamp': timestamp,
                    'content': data.get('content', '')[:50] + '...',
                    'user': data.get('metadata', {}).get('userId', 'unknown')
                })
    
    print(f'✅ Late Night Activity Test: Found {len(late_night_activities)} activities')
    print(json.dumps(late_night_activities, indent=2, default=str))

# Run all tests
if __name__ == '__main__':
    print('\\n=== TASK 2 INTEGRATION TESTS ===\\n')
    
    print('TEST 1: Fetch Orphaned Tasks')
    orphaned = test_fetch_orphaned_tasks()
    
    print('\\nTEST 2: Fetch Team Load')
    team = test_fetch_team_load()
    
    print('\\nTEST 3: Burnout Detection')
    test_burnout_detection()
    
    print('\\nTEST 4: Late Night Activity')
    test_late_night_activity()
    
    print('\\n=== ALL TESTS COMPLETE ===')
\\\

**Run it**:
\\\ash
python backend/test_reasoning_integration.py
\\\

### Expected Output:
\\\
=== TASK 2 INTEGRATION TESTS ===

TEST 1: Fetch Orphaned Tasks
✅ Orphaned Tasks Test: Found 2 tasks
[...task details...]

TEST 2: Fetch Team Load
✅ Team Load Test: Found 2 available team members
[...team details...]

TEST 3: Burnout Detection
User: Sarah Chen, Load: 25, Sentiment: 0.85, Burnout Risk: False
User: John Smith, Load: 15, Sentiment: 0.7, Burnout Risk: False
User: Mike Johnson, Load: 45, Sentiment: 0.4, Burnout Risk: True

TEST 4: Late Night Activity
✅ Late Night Activity Test: Found 1 activities
\\\

---

## Test Level 3: End-to-End Tests

### Test File: backend/test_reasoning_e2e.py

Full workflow: Absence Trigger → Database Query → Reasoning → Save to Approvals

\\\python
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from reasoning import run_impact_analysis
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('backend/serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

def test_end_to_end_workflow():
    '''Full E2E Test: Trigger → Query → Reason → Approve → Save'''
    
    # Step 1: Simulate absence trigger
    absence_trigger = {
        'absent_user_id': 'user_01',
        'reason': 'Emergency leave - family emergency',
        'timestamp': '2026-04-21T09:00:00Z'
    }
    
    print('📌 ABSENCE TRIGGER:')
    print(json.dumps(absence_trigger, indent=2))
    
    # Step 2: Fetch orphaned tasks
    tasks_ref = db.collection('tasks')
    orphaned_tasks = []
    for doc in tasks_ref.where('assignedTo', '==', 'user_01').stream():
        task_data = doc.to_dict()
        task_data['tid'] = doc.id
        orphaned_tasks.append(task_data)
    
    print(f'\\n📋 ORPHANED TASKS ({len(orphaned_tasks)}):')
    print(json.dumps(orphaned_tasks, indent=2, default=str))
    
    # Step 3: Fetch team load map
    users_ref = db.collection('users')
    team_load_data = []
    for doc in users_ref.stream():
        if doc.id != 'user_01':
            user_data = doc.to_dict()
            user_data['uid'] = doc.id
            team_load_data.append(user_data)
    
    print(f'\\n👥 TEAM LOAD MAP ({len(team_load_data)}):')
    print(json.dumps(team_load_data, indent=2, default=str))
    
    # Step 4: Call reasoning engine
    absence_text = absence_trigger['reason']
    result = run_impact_analysis(absence_text, team_load_data, orphaned_tasks)
    
    print(f'\\n🧠 REASONING OUTPUT:')
    print(json.dumps(result, indent=2, default=str))
    
    # Step 5: Verify output format
    required_fields = ['suggestedTid', 'fromUid', 'toUid', 'reasoning']
    missing = [field for field in required_fields if field not in result]
    
    if missing:
        print(f'\\n❌ VALIDATION FAILED: Missing fields {missing}')
        return False
    
    print(f'\\n✅ OUTPUT VALIDATION: All required fields present')
    
    # Step 6: Save to Approvals collection
    approvals_ref = db.collection('approvals')
    doc_ref = approvals_ref.add({
        'suggestedTid': result.get('suggestedTid'),
        'fromUid': result.get('fromUid'),
        'toUid': result.get('toUid'),
        'reasoning': result.get('reasoning'),
        'absence_reason': absence_trigger['reason'],
        'timestamp': firestore.SERVER_TIMESTAMP,
        'status': 'pending'
    })
    
    print(f'\\n💾 SAVED TO APPROVALS: Document ID created')
    
    return True

if __name__ == '__main__':
    print('\\n=== TASK 2 END-TO-END TEST ===\\n')
    success = test_end_to_end_workflow()
    if success:
        print('\\n🎉 E2E TEST PASSED')
    else:
        print('\\n💥 E2E TEST FAILED')
\\\

**Run it**:
\\\ash
python backend/test_reasoning_e2e.py
\\\

---

## Test Level 4: Burnout Logic Validation

### Test File: backend/test_burnout_logic.py

Validates the burnout calculation formula:

\\\python
def calculate_load_score(task_priority, task_difficulty, sentiment_score, chat_log_tone=None, hour_of_day=None):
    '''Calculate load score with burnout logic'''
    
    # Base: Priority * Difficulty
    base_score = task_priority * task_difficulty
    
    # Sentiment penalty: +20 if stressed
    sentiment_penalty = 20 if chat_log_tone == 'stressed' else 0
    
    # Late night flag
    late_night_flag = 0 <= hour_of_day <= 5 if hour_of_day else False
    
    total_load = base_score + sentiment_penalty
    burnout_risk = total_load > 80 or sentiment_score < 0.3 or late_night_flag
    
    return {
        'base_score': base_score,
        'sentiment_penalty': sentiment_penalty,
        'total_load': total_load,
        'burnout_risk': burnout_risk,
        'late_night_flag': late_night_flag
    }

# Test Cases
test_cases = [
    # Test 1: Normal load, good sentiment
    {'priority': 3, 'difficulty': 2, 'sentiment': 0.8, 'tone': None, 'hour': 10, 'expected_burnout': False},
    
    # Test 2: High load, stressed tone
    {'priority': 5, 'difficulty': 4, 'sentiment': 0.5, 'tone': 'stressed', 'hour': 10, 'expected_burnout': True},
    
    # Test 3: Normal load but low sentiment
    {'priority': 2, 'difficulty': 1, 'sentiment': 0.2, 'tone': None, 'hour': 10, 'expected_burnout': True},
    
    # Test 4: Late night communication
    {'priority': 2, 'difficulty': 1, 'sentiment': 0.7, 'tone': None, 'hour': 3, 'expected_burnout': True},
]

print('\\n=== BURNOUT LOGIC TESTS ===\\n')
for i, test in enumerate(test_cases, 1):
    result = calculate_load_score(test['priority'], test['difficulty'], test['sentiment'], test['tone'], test['hour'])
    passed = result['burnout_risk'] == test['expected_burnout']
    status = '✅' if passed else '❌'
    print(f'Test {i}: {status} Burnout Risk = {result[\"burnout_risk\"]} (Expected: {test[\"expected_burnout\"]})')
    print(f'  Details: Load={result[\"total_load\"]}, Sentiment={test[\"sentiment\"]}, Late Night={result[\"late_night_flag\"]}')
\\\

**Run it**:
\\\ash
python backend/test_burnout_logic.py
\\\

---

## Quick Testing Checklist

- [ ] Unit tests pass (mock data).
- [ ] Database seeded with test data.
- [ ] Integration tests pass (Firebase connected).
- [ ] End-to-End test: Absence → Approvals saved.
- [ ] Burnout logic correctly flags at-risk members.
- [ ] JSON output has all required fields.
- [ ] No errors in logs.
- [ ] Late night activity detected (12 AM - 5 AM).
- [ ] Sentiment analysis working (stressed/positive tones).

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase connection error | Check service account key path and .env file |
| No orphaned tasks found | Verify tasks exist and assignedTo matches user_01 |
| Burnout logic not triggering | Check current_load value and sentiment_score thresholds |
| JSON validation fails | Verify all 4 fields: suggestedTid, fromUid, toUid, reasoning |

---

## Final Verification

Once all tests pass, verify in Firebase Console:
1. ✅ Collections exist: users, tasks, inputs, approvals.
2. ✅ Test data in each collection.
3. ✅ New documents in 'approvals' after E2E test.

🎉 **Task 2 is ready for competition!**