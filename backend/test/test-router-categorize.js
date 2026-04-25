// backend/test-router-categorize.js
require('dotenv').config();
const routerAgent = require('./services/routerAgent');

async function test() {
    console.log('🧪 Testing Router Email Categorization...\n');

    // Test with your seeded "Medical Leave - SY" input
    const mockInput = {
        subject: "Medical Leave - SY",
        content: "Boss, I'm feeling quite unwell. Going to see a doctor.",
        metadata: { sender: "sy@zenius.ai" },
        parsedFileContent: "MEDICAL CERTIFICATE\nName: SY\nDays: 2"
    };

    console.log('Input:', mockInput.subject);
    const result = await routerAgent.categorizeEmail(mockInput);
    
    console.log('\n✅ Categorization Result:');
    console.log('   Category:', result.category);
    console.log('   Confidence:', result.confidence);
    console.log('   Action:', result.recommendedAction);
    console.log('   Provider:', result.provider);
    console.log('   Extracted:', JSON.stringify(result.extractedInfo, null, 2));
}

test().catch(console.error);