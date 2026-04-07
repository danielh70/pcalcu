const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk').default;

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/read-photo', async (req, res) => {
  const { image, mediaType } = req.body;
  if (!image || !mediaType) {
    return res.status(400).json({ error: 'image and mediaType are required' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image },
            },
            {
              type: 'text',
              text: 'This photo contains handwritten transit/level rod readings for fence or deck posts. Extract each measurement. Return ONLY a JSON array of objects with "label" (e.g. "Post 1", "Post 2") and "inches" (the reading as a string, e.g. "60 1/4"). No other text.',
            },
          ],
        },
      ],
    });

    const text = message.content[0].text.trim();
    // Extract JSON array even if wrapped in markdown fences
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse measurements from response' });
    }
    const measurements = JSON.parse(jsonMatch[0]);
    res.json({ measurements });
  } catch (err) {
    console.error('read-photo error:', err.message);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Serve CRA build in production
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
