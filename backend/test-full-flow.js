// backend/test-full-flow.js
require('dotenv').config();
const routerAgent = require('./services/routerAgent');
const { db } = require('./config/firebase-admin');

async function testFullFlow() {
    console.log('🔍 Fetching unprocessed inputs...\n');
    
    try {
        const inputs = await db.collection('inputs')
        .where('processed', '==', false)
        .get();
        
        console.log(`Found ${inputs.size} unprocessed inputs\n`);
        
        if (inputs.empty) {
        console.log('💡 Tip: Run seed.js first to populate test data');
        console.log('   Or reset processed flags in Firestore console');
        return;
        }
        
        for (const doc of inputs.docs) {
        console.log('📨 Processing:', doc.id);
        try {
            const result = await routerAgent.processInput(doc.id);
            console.log('✅ Result:', result.category, '-', result.result?.status);
            console.log('   Details:', JSON.stringify(result.result, null, 2).substring(0, 300) + '...\n');
        } catch (err) {
            console.error('❌ Error:', err.message, '\n');
        }
        }
        
        console.log('\n🎉 Full flow test completed!');
        
        // Show summary
        const processed = await db.collection('inputs')
        .where('processed', '==', true)
        .get();
        console.log(`📊 Summary: ${processed.size} inputs processed total`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testFullFlow();