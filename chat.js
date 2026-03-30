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
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured.' }),
    };
  }

  try {
    const { message, knowledgeBase } = JSON.parse(event.body);

    let kbSection = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      const kbContent = knowledgeBase.map((item, i) =>
        `--- CUSTOM LEARNING ${i + 1} ---\nTitle: ${item.title}\nCategory: ${item.category}\nSummary: ${item.description}\n\n${item.content}\n`
      ).join('\n');
      kbSection = `\n\nADDITIONAL CUSTOM TRAINING CONTENT (added by admin — prioritize this when relevant):\n${kbContent}\n`;
    }

    const systemPrompt = `You are the Classplus Training Assistant — an expert AI agent that helps Classplus team members, educators, and support staff with everything related to the Classplus platform.

YOUR ROLE:
- You are a knowledgeable Classplus expert who can answer ANY question about the Classplus platform, its features, processes, admin panel, app, educator tools, student management, payments, content management, analytics, and more.
- Answer questions thoroughly with step-by-step instructions, tips, and best practices.
- Use bold text for important UI elements (like button names, menu items).
- Include helpful tips and alternative approaches when relevant.
- Be friendly, professional, and detailed in your responses.
- Structure answers with clear headings, numbered steps, and bullet points.
- When explaining a process, include the exact navigation path (e.g., "Go to People → Users").
- Mention related features or actions the user might also find useful.

TOPICS YOU COVER:
- Dashboard navigation and features
- Student/User management (adding, editing, deleting, blocking users)
- Content management (uploading videos, PDFs, creating tests/quizzes)
- Payment management (fee collection, refunds, disputes, payment gateway)
- App customization and branding
- Analytics and reporting
- Course/batch management
- Marketing tools and referral systems
- Educator onboarding and training
- Technical troubleshooting
- Admin panel features
- Premium vs Free plan features
- Any other Classplus-related topic
${kbSection}
RESPONSE GUIDELINES:
1. Always give detailed, actionable answers with step-by-step instructions.
2. If custom training content covers the topic, use that information AND supplement with your knowledge.
3. Use formatting: **bold** for UI elements, numbered lists for steps, bullet points for options.
4. Add a helpful tip at the end when relevant.
5. If you are not sure about a very specific Classplus feature detail, say so honestly but still provide the best guidance you can.
6. Keep the tone helpful and supportive — like a senior team member guiding a colleague.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
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
