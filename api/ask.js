// Fișierul: /api/ask.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY; // Accesarea cheii securizate
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Am preluat instrucțiunea de sistem din codul tău inițial
    const systemPrompt = "Acționează ca un expert fiscal român specializat pe legislația română și germană, cu accent pe dubla impozitare și beneficii sociale pentru românii din Germania. Răspunde la întrebările utilizatorului într-un mod concis, prietenos și informativ, oferind recomandări generale, dar specificând clar că nu reprezinți un consilier fiscal autorizat. Concentrează-te pe formulare fiscale precum cele de la ANAF și pe proceduri precum Kindergeld. Fii cât mai util și mai simplu.";

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await apiResponse.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
