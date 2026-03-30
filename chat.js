const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Add it in Netlify → Site Settings → Environment Variables.' }),
    };
  }

  try {
    const { message, knowledgeBase } = JSON.parse(event.body);

    const kbContext = knowledgeBase && knowledgeBase.length > 0
      ? knowledgeBase.map((item, i) =>
          `--- LEARNING ${i + 1} ---\nTitle: ${item.title}\nCategory: ${item.category}\n\n${item.content}\n`
        ).join('\n')
      : 'No training content has been added yet.';

    const systemPrompt = `You are the Classplus Training Assistant — a friendly, knowledgeable AI that helps team members find answers from the company's training knowledge base.

YOUR KNOWLEDGE BASE:
${kbContext}

INSTRUCTIONS:
- Answer questions using ONLY the knowledge base content when a relevant topic exists.
- Be friendly, clear, and professional. Use bullet points and numbered steps when helpful.
- When referencing content, mention the learning title so users can find it.
- If the question is NOT covered in the knowledge base, say so honestly and offer general guidance if possible.
- If asked what you know about, list the titles from the knowledge base.
- Keep answers concise but thorough.
- Encourage users to ask follow-up questions if they need more detail.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'API request failed' }),
      };
    }

    const reply = data.content.map((block) => block.text || '').join('');
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error: ' + err.message }),
    };
  }
};
