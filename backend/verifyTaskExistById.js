// Run this in Node REPL or a temporary script
const { db } = require('./config/firebase-admin');

async function checkTask() {
    // Check the Input
    const inputDoc = await db.collection('inputs').doc('lqDJq4GNCz6swesdzWV8').get();
    console.log('Input Category:', inputDoc.data().category);

    // Find the Task created by this Input
    const tasks = await db.collection('tasks')
        .where('sourceInputId', '==', 'lqDJq4GNCz6swesdzWV8')
        .get();
    
    if (tasks.empty) {
        console.log('❌ No task found for this input!');
    } else {
        tasks.forEach(doc => {
        const t = doc.data();
        console.log(`✅ Task Found! ID: ${doc.id}`);
        console.log(`   Title: ${t.title}`);
        console.log(`   Assigned: ${t.assignedTo || 'Unassigned'}`);
        console.log(`   Status: ${t.status}`);
        });
    }
}

checkTask();