// server.js - Express Server pentru MimiFiscal
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servește fișierele din folderul public

// API endpoint pentru chat AI
app.post('/api/ask', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Limitare lungime prompt pentru securitate
    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt too long' });
    }

    // Rate limiting simplu
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log(`AI Request from IP: ${clientIP} - Prompt: ${prompt.substring(0, 50)}...`);

    // Prompt engineering pentru domeniul fiscal românesc-german
    const fiscalPrompt = `
Tu ești MimiFiscal, un asistent AI specializat în fiscalitate pentru românii care lucrează în Germania. 

CONTEXT IMPORTANT:
- Răspunde DOAR în română
- Oferă informații despre impozite, formulare fiscale, Kindergeld, dublă impozitare DE-RO
- Menționează mereu că informațiile sunt generale și recomandă consultarea unui expert fiscal
- Păstrează tonul prietenos și profesional
- Limitează răspunsul la maximum 200 de cuvinte

DOMENII DE EXPERTIZĂ:
- Formulare ANAF pentru dubla impozitare
- Kindergeld și alocații familiale
- Declarații fiscale în Germania vs România
- Certificat de rezidență fiscală
- Deduceri fiscale permise
- Obligații fiscale pentru rezidenții germani cu venituri din România

IMPORTANT: Dacă întrebarea nu este despre fiscalitate sau nu se referă la Germania-România, răspunde politicos că te specializezi doar în sfaturi fiscale pentru românii din Germania.

ÎNTREBAREA UTILIZATORULUI: "${prompt}"

Răspunde profesional, concis și util:`;

    // Integrare cu API-ul Gemini (Google AI)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(200).json({
        candidates: [{
          content: {
            parts: [{
              text: "Serviciul AI este temporar indisponibil. Te rugăm să încerci din nou mai târziu sau să ne contactezi direct la contact@mimifiscal.com"
            }]
          }
        }]
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fiscalPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API Error:', errorData);
      
      return res.status(200).json({
        candidates: [{
          content: {
            parts: [{
              text: "Ne pare rău, dar am întâmpinat o problemă tehnică. Te rugăm să încerci din nou sau să ne contactezi direct pentru asistență."
            }]
          }
        }]
      });
    }

    const data = await geminiResponse.json();
    
    // Verificare dacă răspunsul este valid
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(200).json({
        candidates: [{
          content: {
            parts: [{
              text: "Nu am putut genera un răspuns valid. Te rugăm să reformulezi întrebarea sau să ne contactezi direct."
            }]
          }
        }]
      });
    }

    // Log pentru debugging
    console.log('AI Response generated successfully');
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in AI handler:', error);
    
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{
            text: "A apărut o eroare neașteptată. Te rugăm să încerci din nou mai târziu sau să ne contactezi la contact@mimifiscal.com pentru asistență."
          }]
        }
      }]
    });
  }
});

// Servește index.html pentru toate celelalte rute (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MimiFiscal server running on port ${PORT}`);
  console.log(`🌐 Site available at: http://localhost:${PORT}`);
  console.log(`🤖 AI endpoint: http://localhost:${PORT}/api/ask`);
  
  // Check if Gemini API key is set
  if (process.env.GEMINI_API_KEY) {
    console.log('✅ Gemini API key is configured');
  } else {
    console.log('⚠️  Warning: GEMINI_API_KEY environment variable not set');
    console.log('   Get your free API key at: https://makersuite.google.com/app/apikey');
  }
});
