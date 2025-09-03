export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key missing on server' });
    }

    const systemPrompt = "Acționează ca un expert fiscal român specializat pe legislația română și germană. Răspunde clar, concis și oferă soluții practice pentru românii din Germania. Dacă întrebarea nu are legătură cu fiscalitatea, răspunde politicos că nu este de competența ta.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ error: 'No response from Gemini API' });
    }

    const text = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: 'Server error' });
  }
}
