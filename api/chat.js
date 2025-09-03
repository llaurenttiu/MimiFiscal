// api/chat.js
// Această funcție serverless gestionează apelul către API-ul Gemini, protejând cheia API.

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Verifică dacă cheia API este setată în variabilele de mediu Vercel.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Cheia API (GEMINI_API_KEY) nu este configurată." });
    }

    // Inițializează clientul AI.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    // Verifică metoda de request. Acceptăm doar POST.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoda HTTP nu este permisă.' });
    }

    try {
        // Extrage promptul din corpul request-ului.
        const { prompt } = req.body;
        
        // Verifică dacă promptul există.
        if (!prompt) {
            return res.status(400).json({ error: 'Promptul lipsește.' });
        }

        // Defineste instructiunile de sistem pentru AI.
        const systemPrompt = "Acționează ca un asistent fiscal expert și prietenos pentru românii care locuiesc și lucrează în Germania. Răspunde la întrebări despre impozite, formulare, 'Kindergeld' și alte aspecte fiscale, folosind informații actuale și verificabile. Explică conceptele complexe într-un mod simplu, clar și concis, în limba română. Evită sfaturile financiare personale și recomandă consultarea unui specialist pentru situații complexe.";
        
        // Configurarea cererii către API-ul Gemini cu instrucțiunile și instrumentele de căutare.
        const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });

        // Extrage și trimite răspunsul AI către client.
        const responseText = result.response.text();
        res.status(200).json({ text: responseText });

    } catch (error) {
        console.error("Eroare la procesarea cererii:", error);
        res.status(500).json({ error: "A apărut o eroare la procesarea cererii tale." });
    }
}
