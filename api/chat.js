// /api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, systemPrompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt || "" }]
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text =
      candidate?.content?.parts?.[0]?.text ||
      "Nu am putut genera un răspuns. Încearcă din nou.";

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
