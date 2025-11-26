import { describe, it, expect } from 'vitest';

describe('AI API Keys Validation', () => {
  it('should validate OpenAI API key', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^sk-/);

    // Test with a simple API call
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    console.log(`✅ OpenAI API key valid - ${data.data.length} models available`);
  }, 10000);

  it('should validate Anthropic API key', async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^sk-ant-/);

    // Test with a minimal API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.content).toBeDefined();
    console.log(`✅ Anthropic API key valid - Response: ${data.content[0]?.text}`);
  }, 15000);

  it('should validate Google AI API key', async () => {
    const apiKey = process.env.GOOGLE_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^AIza/);

    // Test with Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(Array.isArray(data.models)).toBe(true);
    console.log(`✅ Google AI API key valid - ${data.models.length} models available`);
  }, 10000);
});
