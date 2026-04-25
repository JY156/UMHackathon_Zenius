// backend/test-helper-only.js
require('dotenv').config();
const helperAgent = require('./services/helperAgent');
const LOAD_CALCULATION = require('./utils/loadCalculationConstants');

async function test() {
    console.log('🧪 Testing Helper Agent (with your LOAD_CALCULATION)...\n');

    // Test 1: Verify LOAD_CALCULATION import works
    console.log('=== Test 0: LOAD_CALCULATION Check ===');
    console.log('Burnout threshold:', LOAD_CALCULATION.BURNOUT_RISK_THRESHOLD);
    console.log('isBurnoutRisk(0.25):', LOAD_CALCULATION.isBurnoutRisk(0.25)); // true
    console.log('isBurnoutRisk(0.5):', LOAD_CALCULATION.isBurnoutRisk(0.5));   // false
    console.log('');

    // Test 2: Find assignee for Firebase task
    console.log('=== Test 1: Find Assignee (Firebase + System Design) ===');
    const assignee1 = await helperAgent.findBestAssignee(
        ['Firebase', 'System Design'],
        'user_nc', // Exclude NC who is overwhelmed
        4,          // High priority
        'Professional' // Category for difficulty multiplier
    );
    console.log('Result:', assignee1?.name || 'None found', '\n');

    // Test 3: Find assignee for Python/API task
    console.log('=== Test 2: Find Assignee (Python + APIs) ===');
    const assignee2 = await helperAgent.findBestAssignee(
        ['Python', 'APIs'],
        null,
        3,
        'Professional'
    );
    console.log('Result:', assignee2?.name || 'None found', '\n');

    // Test 4: Detect overwhelmed users (uses full LOAD_CALCULATION formula)
    console.log('=== Test 3: Detect Overwhelmed Users ===');
    const overwhelmed = await helperAgent.detectOverwhelmedUsers();
    console.log('Overwhelmed:', overwhelmed.map(u => `${u.name} (load: ${u.totalLoad?.toFixed(1)}, sentiment: ${u.sentimentScore})`).join(', ') || 'None', '\n');

    // Test 5: Quick overwhelm check (heuristic, no task fetch)
    console.log('=== Test 4: Quick Overwhelm Heuristic ===');
    const { db } = require('./config/firebase-admin');
    const usersSnap = await db.collection('users').get();
    for (const doc of usersSnap.docs) {
        const data = doc.data();
        const isOverwhelmed = helperAgent.isLikelyOverwhelmed(data);
        if (isOverwhelmed) {
            console.log(`⚠️  ${data.name}: Likely overwhelmed (sentiment: ${data.sentiment_score}, load: ${data.current_load}/${data.task_capacity})`);
        }
    }
    console.log('');

    // Test 6: Sentiment update (dry logic check)
    console.log('=== Test 5: Sentiment Update Logic ===');
    console.log('updateSentiment exists:', typeof helperAgent.updateSentiment === 'function');
    console.log('updateUserLoad exists:', typeof helperAgent.updateUserLoad === 'function');
    console.log('');

    console.log('✅ Helper Agent tests completed!');
}

test().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});