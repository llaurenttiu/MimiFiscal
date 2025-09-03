import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(request, response) {
  try {
    const { prompt } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return response.status(500).json({
        text: "Eroare de server: Cheia API nu este configurată pe server."
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const systemPrompt = "Acționezi ca un asistent fiscal amabil și informat pentru românii care locuiesc și lucrează în Germania. Răspunde la întrebările despre impozite, formulare, taxe și reglementări financiare. Oferă sfaturi concise și utile în limba română.";

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    });

    const aiResponse = result.response.text();
    response.status(200).json({ text: aiResponse });

  } catch (error) {
    console.error("Error in serverless function:", error);
    response.status(500).json({
      text: `A apărut o eroare la procesarea cererii: ${error.message}.`
    });
  }
}
