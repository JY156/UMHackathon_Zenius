// backend/reset-inputs.js
require('dotenv').config();
const { db } = require('./config/firebase-admin');

async function resetInputs() {
    console.log('🔄 Resetting inputs to unprocessed...');
    
    const batch = db.batch();
    const inputs = await db.collection('inputs').get();
    
    inputs.docs.forEach(doc => {
        batch.update(doc.ref, {
        processed: false,
        category: null,
        actionTaken: null,
        processedAt: null
        });
    });
    
    await batch.commit();
    console.log(`✅ Reset ${inputs.size} inputs`);
}

resetInputs().catch(console.error);