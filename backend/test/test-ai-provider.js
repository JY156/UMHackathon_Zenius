const aiProvider = require('./services/aiProvider');

async function test() {
    console.log('🧪 Testing AI Provider...\n');

    // Test 1: Simple text response
    console.log('1. Text response test:');
    const textResult = await aiProvider.chat({
        prompt: 'What is 2+2? Answer in one word.',
        temperature: 0
    });
    console.log('   Response:', textResult.content, `(via ${textResult.provider})\n`);

    // Test 2: JSON response
    console.log('2. JSON response test:');
    const jsonResult = await aiProvider.chat({
        prompt: 'Categorize this email: "I need to take sick leave tomorrow"',
        systemPrompt: 'Return JSON: { "category": "leave|stress|task|general", "confidence": 0-1 }',
        responseFormat: 'json',
        temperature: 0.1
    });
    console.log('   Response:', jsonResult.content, `(via ${jsonResult.provider})\n`);

    console.log('✅ AI Provider tests passed!');
}

test().catch(console.error);