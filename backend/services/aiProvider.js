// backend/services/aiProvider.js
require('dotenv').config();

class AIProvider {
    constructor() {
        this.primary = process.env.AI_PRIMARY || 'zai';
        this.fallback = process.env.AI_FALLBACK || 'gemini';
        this.timeout = parseInt(process.env.AI_TIMEOUT_MS) || 30000;
        
        // ✅ Model selection based on your available quotas
        this.models = {
            // Primary reasoning model (if using Gemini)
            reasoning: process.env.GEMINI_REASONING_MODEL || 'gemini-2.5-flash',
            // Fallback model (stable, high limits)
            fallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.0-flash',
            // Lite model for simple tasks (optional)
            lite: process.env.GEMINI_LITE_MODEL || 'gemini-2.0-flash-lite'
        };
    }

    /**
     * Unified chat interface - works with any provider
     */
    async chat({ prompt, systemPrompt = '', responseFormat = 'text', temperature = 0.2, taskType = 'reasoning' }) {
        const providers = [this.primary];
        if (this.fallback && this.fallback !== this.primary) {
            providers.push(this.fallback);
        }

        let lastError;

        for (const provider of providers) {
            try {
                console.log(`🤖 Trying AI provider: ${provider}`);
                
                const result = await this._withRetry(() => 
                    this._callProvider(provider, {
                        prompt,
                        systemPrompt,
                        responseFormat,
                        temperature,
                        timeout: this.timeout,
                        taskType // Pass task type for model selection
                    })
                );

                console.log(`✅ Success with ${provider}`);
                return { ...result, provider: provider };

            } catch (error) {
                console.warn(`⚠️ ${provider} failed: ${error.message}`);
                lastError = error;
            }
        }

        console.warn('⚠️  All AI providers failed, returning null decision');
        return { content: null, provider: null, error: lastError?.message };
    }

    /**
     * Internal: Call specific provider
     */
    async _callProvider(provider, { prompt, systemPrompt, responseFormat, temperature, timeout, taskType = 'reasoning' }) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            switch (provider) {
                case 'zai':
                    return await this._callZAI({ prompt, systemPrompt, responseFormat, temperature, signal: controller.signal });
                case 'gemini':
                    return await this._callGemini({ prompt, systemPrompt, responseFormat, temperature, signal: controller.signal, taskType });
                case 'openai':
                    return await this._callOpenAI({ prompt, systemPrompt, responseFormat, temperature, signal: controller.signal });
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Retry helper with exponential backoff
     */
    async _withRetry(fn, maxRetries = 2, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                // Don't retry on auth/model errors
                if (error.message.includes('401') || 
                    error.message.includes('404') || 
                    error.message.includes('invalid_api_key')) {
                    throw error;
                }
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`⏳ Retry ${attempt}/${maxRetries} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }

    /**
     * Z.AI (ILMU GLM) API Call
     */
    async _callZAI({ prompt, systemPrompt, responseFormat, temperature, signal }) {
        const apiKey = process.env.ZAI_API_KEY;
        if (!apiKey) throw new Error('ZAI_API_KEY not set in environment');

        const baseUrl = 'https://api.ilmu.ai/v1/chat/completions';
        const model = 'ilmu-glm-5.1';

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: temperature,
                ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
            }),
            signal
        });

        const responseText = await response.text();
        if (!response.ok) throw new Error(`Z.AI API error ${response.status}: ${responseText}`);

        let data;
        try { data = JSON.parse(responseText); } 
        catch (e) { throw new Error(`Z.AI returned invalid JSON: ${responseText.substring(0, 200)}`); }

        const message = data.choices?.[0]?.message;
        let content = message?.content || message?.text || data.content;
        if (!content || content.trim() === '') throw new Error('Z.AI returned empty response');

        return {
            content: responseFormat === 'json' ? this.extractJSON(content) : content,
            raw: data
        };
    }

    /**
     * ✅ Google Gemini API Call - Updated with your available models
     */
    async _callGemini({ prompt, systemPrompt, responseFormat, temperature, signal, taskType = 'reasoning' }) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY not set in environment');

        // ✅ Select model based on task type (conserves credits)
        const model = this._selectGeminiModel(taskType);
        console.log(`   🎯 Using Gemini model: ${model} (task: ${taskType})`);
        
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUSER: ${prompt}\nASSISTANT:` : prompt;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: temperature,
                    responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain',
                    stopSequences: responseFormat === 'json' ? ['```'] : []
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            }),
            signal
        });

        const responseText = await response.text();
        if (!response.ok) throw new Error(`Gemini API error ${response.status}: ${responseText}`);

        let data;
        try { data = JSON.parse(responseText); } 
        catch (e) { throw new Error(`Gemini returned invalid JSON: ${responseText.substring(0, 200)}`); }

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error('Gemini returned empty response');

        return {
            content: responseFormat === 'json' ? this.extractJSON(content) : content,
            raw: data
        };
    }

    /**
     * ✅ Select Gemini model based on task type (credit-conscious)
     */
    _selectGeminiModel(taskType) {
        switch (taskType) {
            case 'reasoning':
                // Use 2.5 Flash for categorization, decision-making (good balance)
                return this.models.reasoning; 
            case 'simple':
                // Use Flash Lite for simple extractions, saves credits
                return this.models.lite;
            case 'complex':
                // Use 2.5 Pro only for very complex reasoning (use sparingly)
                return 'gemini-2.5-pro';
            default:
                // Default to stable Flash with high limits
                return this.models.fallback;
        }
    }

    /**
     * OpenAI API Call (optional)
     */
    async _callOpenAI({ prompt, systemPrompt, responseFormat, temperature, signal }) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY not set in environment');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: temperature,
                response_format: responseFormat === 'json' ? { type: 'json_object' } : { type: 'text' }
            }),
            signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');

        return {
            content: responseFormat === 'json' ? this.extractJSON(content) : content,
            raw: data
        };
    }

    /**
     * Robust JSON extraction
     */
    extractJSON(text) {
        if (!text) return null;
        if (typeof text === 'object') return text;
        
        let cleaned = text.trim();
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try { parsed = JSON.parse(jsonMatch[0]); } 
                catch (e2) { return null; }
            } else { return null; }
        }
        
        if (typeof parsed === 'string' && (parsed.startsWith('{') || parsed.startsWith('['))) {
            try { return JSON.parse(parsed); } 
            catch (e) { return parsed; }
        }
        
        return parsed;
    }
}

module.exports = new AIProvider();