require('dotenv').config();

async function testZAI() {
    const apiKey = process.env.ZAI_API_KEY;
    console.log('🔍 Testing Z.AI (ILMU) Connection...\n');
    console.log('Endpoint: https://api.ilmu.ai/v1/chat/completions');
    console.log('Model: ilmu-glm-5.1');
    console.log('API Key present:', !!apiKey, '\n');

    try {
        const response = await fetch('https://api.ilmu.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'ilmu-glm-5.1',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Return valid JSON only.' },
                    { role: 'user', content: 'Return JSON: {"test": "success", "model": "ilmu-glm-5.1"}' }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        console.log('📡 Response Status:', response.status);
        const text = await response.text();
        
        if (response.ok) {
            const json = JSON.parse(text);
            console.log('✅ Parsed Response:');
            console.log('   Content:', json.choices?.[0]?.message?.content);
            console.log('   Full:', JSON.stringify(json, null, 2).substring(0, 300) + '...');
        } else {
            console.log('❌ Error Response:', text);
        }
    } catch (error) {
        console.error('❌ Connection Error:', error.message);
    }
}

testZAI().catch(console.error);