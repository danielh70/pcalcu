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
              text: 'This photo contains handwritten transit/level rod readings for fence or deck posts. Extract each measurement and determine the spatial layout of the posts as drawn. Number posts left-to-right, top-to-bottom. Return ONLY a JSON object (no other text) in this exact format: {"measurements": [{"label": "Post 1", "inches": "60 1/4", "row": 0, "col": 0}, ...], "rows": 2, "cols": 4} where row and col represent each post\'s grid position as drawn (0-indexed).',
            },
          ],
        },
      ],
    });

    const text = message.content[0].text.trim();
    // Extract JSON object even if wrapped in markdown fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse measurements from response' });
    }
    const data = JSON.parse(jsonMatch[0]);
    res.json(data);
  } catch (err) {
    console.error('read-photo error:', err.message);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Serve CRA build in production
app.use(express.static(path.join(__dirname, 'build')));
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
