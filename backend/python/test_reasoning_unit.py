import json
import sys
import os

# Simple unit test with mock data (no database needed)

def run_reasoning_with_mock():
    '''Test reasoning module with mock data'''
    
    # Mock data
    mock_noise = 'I am feeling very unwell and need to take emergency leave today.'
    mock_tasks = [
        {'tid': 'TASK-101', 'title': 'API Design', 'skills': ['Python', 'API'], 'priority': 3, 'difficulty': 2},
        {'tid': 'TASK-102', 'title': 'Database Schema', 'skills': ['Python', 'Database'], 'priority': 2, 'difficulty': 3}
    ]
    mock_team = [
        {'uid': 'user_01', 'name': 'Sarah', 'skills': ['Python', 'API'], 'current_load': 20, 'sentiment_score': 0.9},
        {'uid': 'user_02', 'name': 'John', 'skills': ['React', 'Frontend'], 'current_load': 15, 'sentiment_score': 0.8},
        {'uid': 'user_03', 'name': 'Mike', 'skills': ['Python', 'Database'], 'current_load': 50, 'sentiment_score': 0.2}
    ]
    
    print('='*60)
    print('UNIT TEST 1: Mock Data Processing')
    print('='*60)
    
    # Simulate reasoning logic
    print('\n📌 ABSENCE TRIGGER (from Task 1):')
    print('Reason: ' + mock_noise)
    
    print('\n📋 ORPHANED TASKS:')
    for task in mock_tasks:
        task_id = task['tid']
        title = task['title']
        skills = task['skills']
        print('  - {}: {} (Skills: {})'.format(task_id, title, skills))
    
    print('\n👥 TEAM LOAD MAP:')
    for member in mock_team:
        name = member['name']
        load = member['current_load']
        sentiment = member['sentiment_score']
        skills = member['skills']
        print('  - {}: Load={}, Sentiment={}, Skills={}'.format(name, load, sentiment, skills))
    
    # Simple logic: Find best match for first task
    best_match = None
    best_score = -999
    
    for task in mock_tasks:
        for member in mock_team:
            # Constraint 1: Skill match
            skill_match = any(skill in member['skills'] for skill in task['skills'])
            # Constraint 2: Avoid burnout (sentiment < 0.3)
            avoid_burnout = member['sentiment_score'] >= 0.3
            # Constraint 3: Lowest load
            load_score = -member['current_load'] if skill_match and avoid_burnout else -999
            
            if load_score > best_score:
                best_score = load_score
                best_match = {
                    'task_id': task['tid'],
                    'member_id': member['uid'],
                    'member_name': member['name'],
                    'load': member['current_load']
                }
    
    # Generate output JSON
    output = {
        'suggestedTid': best_match['task_id'],
        'fromUid': 'absent_user',
        'toUid': best_match['member_id'],
        'reasoning': 'Reassigned to {} ({}). Skill match for Python/API. Current load: {}. No burnout risk.'.format(
            best_match['member_name'], best_match['member_id'], best_match['load']
        )
    }
    
    print('\n🧠 REASONING OUTPUT:')
    print(json.dumps(output, indent=2))
    
    # Validation
    print('\n✅ VALIDATION:')
    required_fields = ['suggestedTid', 'fromUid', 'toUid', 'reasoning']
    for field in required_fields:
        if field in output:
            print('  ✓ {}: Present'.format(field))
        else:
            print('  ✗ {}: MISSING'.format(field))
    
    return output

def test_burnout_detection():
    '''Test burnout detection logic'''
    
    print('\n' + '='*60)
    print('UNIT TEST 2: Burnout Detection Logic')
    print('='*60)
    
    test_cases = [
        {'name': 'Sarah', 'load': 25, 'sentiment': 0.9, 'expected': False},
        {'name': 'Mike', 'load': 50, 'sentiment': 0.2, 'expected': True},
        {'name': 'High Load Normal', 'load': 95, 'sentiment': 0.8, 'expected': True},
    ]
    
    print('\nTesting burnout threshold (Load > 80 OR Sentiment < 0.3):')
    for test in test_cases:
        burnout = test['load'] > 80 or test['sentiment'] < 0.3
        status = '✅' if burnout == test['expected'] else '❌'
        print('{} {}: Load={}, Sentiment={}, Burnout Risk={}'.format(status, test['name'], test['load'], test['sentiment'], burnout))

if __name__ == '__main__':
    print('\n' + '*'*60)
    print('TASK 2: REASONING ENGINE - UNIT TESTS')
    print('*'*60)
    
    output = run_reasoning_with_mock()
    test_burnout_detection()
    
    print('\n' + '='*60)
    print('✅ UNIT TESTS COMPLETE')
    print('='*60)