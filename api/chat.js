// This is a Vercel Serverless Function that acts as a proxy for the Gemini API.
// It hides the API key and avoids CORS issues.

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed');
    }

    // Extract the prompt from the request body
    const { prompt } = request.body;

    if (!prompt) {
        return response.status(400).send('Prompt is required.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    // Define the system instruction for the AI
    const systemPrompt = "Acționează ca un asistent fiscal expert și prietenos pentru românii care locuiesc și lucrează în Germania. Răspunde la întrebări despre impozite, formulare, 'Kindergeld' și alte aspecte fiscale, folosind informații actuale și verificabile. Explică conceptele complexe într-un mod simplu, clar și concis, în limba română. Evită sfaturile financiare personale și recomandă consultarea unui specialist pentru situații complexe.";
    
    // Construct the payload for the API request
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("API Error:", geminiResponse.status, errorText);
            return response.status(geminiResponse.status).json({ error: "Eroare la apelul API extern." });
        }

        const result = await geminiResponse.json();
        const candidate = result.candidates?.[0];
        let text = 'A apărut o problemă la procesarea răspunsului.';

        if (candidate && candidate.content?.parts?.[0]?.text) {
            text = candidate.content.parts[0].text;
        }

        // Send the AI's response back to the client
        return response.status(200).json({ text: text });
        
    } catch (error) {
        console.error("Server-side error:", error);
        return response.status(500).json({ error: "Eroare la comunicarea cu serverul." });
    }
}
