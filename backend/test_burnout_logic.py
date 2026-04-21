import json
from datetime import datetime

def calculate_load_score(task_priority, task_difficulty, sentiment_score, chat_tone=None, hour_of_day=None):
    '''Calculate member load score with burnout logic'''
    
    # Base score from tasks
    base_score = task_priority * task_difficulty
    
    # Sentiment penalty: +20 if stressed tone detected
    sentiment_penalty = 20 if chat_tone == 'stressed' else 0
    
    # Late night activity flag
    late_night_flag = (0 <= hour_of_day <= 5) if hour_of_day is not None else False
    
    # Total load score
    total_load = base_score + sentiment_penalty
    
    # Burnout determination
    burnout_risk = (total_load > 80) or (sentiment_score < 0.3) or late_night_flag
    
    return {
        'base_score': base_score,
        'sentiment_penalty': sentiment_penalty,
        'total_load': total_load,
        'burnout_risk': burnout_risk,
        'late_night_flag': late_night_flag
    }

if __name__ == '__main__':
    print('\n' + '*'*70)
    print('TASK 2: BURNOUT DETECTION LOGIC TEST')
    print('*'*70)
    
    # Test cases with different scenarios
    test_cases = [
        {
            'name': 'Normal Member',
            'priority': 3,
            'difficulty': 2,
            'sentiment': 0.85,
            'tone': None,
            'hour': 10,
            'expected_burnout': False,
            'description': 'Normal load, high sentiment, business hours'
        },
        {
            'name': 'Very High Load Member',
            'priority': 10,
            'difficulty': 9,
            'sentiment': 0.7,
            'tone': None,
            'hour': 14,
            'expected_burnout': True,
            'description': 'Load score = 90 (> 80) = burnout'
        },
        {
            'name': 'Extremely Overwhelmed',
            'priority': 10,
            'difficulty': 10,
            'sentiment': 0.5,
            'tone': None,
            'hour': 10,
            'expected_burnout': True,
            'description': 'Load score = 100 (> 80) = burnout'
        },
        {
            'name': 'Low Sentiment Member',
            'priority': 2,
            'difficulty': 1,
            'sentiment': 0.2,
            'tone': None,
            'hour': 10,
            'expected_burnout': True,
            'description': 'Sentiment score 0.2 < 0.3 = burnout'
        },
        {
            'name': 'Late Night Worker',
            'priority': 2,
            'difficulty': 1,
            'sentiment': 0.75,
            'tone': None,
            'hour': 3,
            'expected_burnout': True,
            'description': 'Communication at 3 AM = high risk'
        },
        {
            'name': 'Midnight Edge Case',
            'priority': 2,
            'difficulty': 1,
            'sentiment': 0.75,
            'tone': None,
            'hour': 0,
            'expected_burnout': True,
            'description': 'Midnight (hour 0) = late night flag'
        },
    ]
    
    print('\nBURNOUT THRESHOLDS:')
    print('  • Load Score > 80')
    print('  • Sentiment Score < 0.3')
    print('  • Communication between 12 AM - 5 AM')
    print('  • Detected stressed tone (+20 penalty)')
    
    print('\n' + '-'*70)
    print('TEST RESULTS:')
    print('-'*70)
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        result = calculate_load_score(
            test['priority'],
            test['difficulty'],
            test['sentiment'],
            test['tone'],
            test['hour']
        )
        
        # Check if result matches expectation
        test_passed = result['burnout_risk'] == test['expected_burnout']
        
        if test_passed:
            passed += 1
            status = '✅ PASS'
        else:
            failed += 1
            status = '❌ FAIL'
        
        print('')
        print('Test {}: {}'.format(i, status))
        print('  Name: {}'.format(test['name']))
        print('  Description: {}'.format(test['description']))
        print('  Input:')
        print('    - Task Priority: {}'.format(test['priority']))
        print('    - Task Difficulty: {}'.format(test['difficulty']))
        print('    - Sentiment Score: {}'.format(test['sentiment']))
        print('    - Chat Tone: {}'.format(test['tone'] or 'normal'))
        print('    - Hour of Day: {}:00'.format(test['hour']))
        print('  Calculation:')
        print('    - Base Score: {} (priority × difficulty)'.format(result['base_score']))
        print('    - Sentiment Penalty: +{}'.format(result['sentiment_penalty']))
        print('    - Total Load: {}'.format(result['total_load']))
        print('    - Late Night Flag: {}'.format(result['late_night_flag']))
        print('  Output:')
        print('    - Burnout Risk: {} (Expected: {})'.format(result['burnout_risk'], test['expected_burnout']))
    
    print('\n' + '='*70)
    print('SUMMARY: {} Passed, {} Failed'.format(passed, failed))
    print('='*70)
    
    if failed == 0:
        print('\n🎉 ALL BURNOUT TESTS PASSED!')
    else:
        print('\n⚠️  {} test(s) failed. Review logic.'.format(failed))