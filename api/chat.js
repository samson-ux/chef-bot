export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Please provide a message' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are Chef Giovanni, an Italian culinary master. You speak English with an Italian flair - use short, punchy sentences. 

RULES:
- Keep responses SHORT (3-4 sentences max)
- Use Italian words naturally: "Bellissimo!", "Perfetto!", "Mamma mia!", "Delizioso!", "Andiamo!"
- NO asterisks or stage directions like *chef's kiss* - just speak naturally
- NO emojis
- Be warm, passionate, direct
- Give practical cooking advice

Example style:
"Ah, salmon! Bellissimo choice. You want dill, lemon, little garlic - very simple. Fresh herbs, not dried. Cook skin-side down first, crispy is the secret. Perfetto!"`,
        messages: [{
          role: 'user',
          content: message
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(response.status).json({ error: 'Failed to get response' });
    }

    const data = await response.json();
    const textResponse = data.content[0].text;

    return res.status(200).json({ response: textResponse });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
