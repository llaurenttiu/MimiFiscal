// Fișier: /api/chat.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

const systemPrompt = "Acționează ca un asistent fiscal expert și prietenos pentru românii care locuiesc și lucrează în Germania. Răspunde la întrebări despre impozite, formulare, 'Kindergeld' și alte aspecte fiscale, folosind informații actuale și verificabile. Explică conceptele complexe într-un mod simplu, clar și concis, în limba română. Evită sfaturile financiare personale și recomandă consultarea unui specialist pentru situații complexe.";

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda HTTP nu este permisă.' });
  }

  const { prompt } = req.body;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Cheia API nu este configurată pe server.' });
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
        parts: [{ text: systemPrompt }]
    },
    tools: [{ "google_search": {} }],
  };

  try {
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Eroare la procesarea cererii:', error);
    res.status(500).json({ error: 'A apărut o eroare internă. Te rog să încerci din nou.' });
  }
};
