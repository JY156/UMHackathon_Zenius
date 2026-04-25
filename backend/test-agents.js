const helperAgent = require('./services/helperAgent');
const routerAgent = require('./services/routerAgent');
const taskManagementAgent = require('./services/taskManagementAgent');

async function testAgents() {
    console.log('🧪 Testing AI Agents...\n');

    // Test 1: Find best assignee
    console.log('=== Test 1: Find Best Assignee ===');
    const assignee = await helperAgent.findBestAssignee(
        ['Firebase', 'System Design'],
        'user_nc', // Exclude NC who is overwhelmed
        4
    );
    console.log('Best assignee:', assignee?.name || 'None found\n');

    // Test 2: Check overwhelmed users
    console.log('=== Test 2: Check Overwhelmed Users ===');
    const overwhelmed = await helperAgent.detectOverwhelmedUsers();
    console.log('Overwhelmed users:', overwhelmed.map(u => u.name).join(', ') || 'None\n');

    // Test 3: Create new task
    console.log('=== Test 3: Create New Task ===');
    const newTask = await taskManagementAgent.createNewTask({
        title: 'Test Task - AI Agent Integration',
        description: 'Testing the new task creation flow',
        requiredSkills: ['Node.js', 'APIs'],
        priority: 3,
        estimatedEffort: 4,
        projectId: 'proj_testing'
    });
    console.log('Task created:', newTask.status, '\n');

    // Test 4: Process an input (if you have unprocessed inputs)
    console.log('=== Test 4: Process Input ===');
    const { db } = require('./config/firebase-admin');
    const inputsSnapshot = await db.collection('inputs')
        .where('processed', '==', false)
        .limit(1)
        .get();

    if (!inputsSnapshot.empty) {
        const inputId = inputsSnapshot.docs[0].id;
        const result = await routerAgent.processInput(inputId);
        console.log('Input processed:', result.status, '\n');
    } else {
        console.log('No unprocessed inputs found\n');
    }

    console.log('✅ All tests completed!');
}

testAgents().catch(console.error);