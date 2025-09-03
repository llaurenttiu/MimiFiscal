// Acest fișier este o funcție serverless Vercel care va rula pe backend
// și va ascunde cheia API de codul public al site-ului.

// Importă modulul necesar.
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configurează-ți modelul Generative AI.
// Cheia API este citită dintr-o variabilă de mediu, nu este vizibilă public.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Definește handler-ul pentru API.
export default async function handler(req, res) {
  // Asigură-te că cererea este de tip POST și are un prompt.
  if (req.method !== 'POST' || !req.body.prompt) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const userPrompt = req.body.prompt;
  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 200,
      temperature: 0.7,
      topK: 0,
      topP: 0.95
    },
  });

  try {
    const result = await chat.sendMessage(userPrompt);
    const text = result.response.text();
    // Trimite textul înapoi către frontend-ul tău.
    res.status(200).json({ text: text });
  } catch (error) {
    console.error('Error with Generative AI API:', error);
    res.status(500).json({ error: 'A apărut o eroare la comunicarea cu AI-ul.' });
  }
}
