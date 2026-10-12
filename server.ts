import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize server-side Gemini client with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Rule-based authentic Capixaba dialect transformer fallback
function applyCapixabaFallbackTranslation(text: string): string {
  let translated = text.trim();

  const rules: [RegExp, string][] = [
    [/\bpão francês\b/gi, 'pão de sal'],
    [/\bmuito bom\b|\bexcelente\b|\bmaravilhoso\b|\bfantástico\b/gi, 'massa demais, pocou'],
    [/\bvamos lá\b|\bvamos\b|\bvamos sair\b|\bgostaria de ir\b/gi, 'bora ali'],
    [/\bolá pessoal\b|\bprezados colegas\b|\bprezados\b|\bcaros colegas\b/gi, 'e aí galera, qual é a boa?'],
    [/\bolá\b|\bboa tarde\b|\bbom dia\b|\bboa noite\b/gi, 'qual é a boa?'],
    [/\bcomo você está\b|\bcomo vocês estão\b|\btudo bem com você\b/gi, 'como cê tá, tudo massa?'],
    [/\bestou a caminho\b|\bestou indo\b|\bestou chegando\b/gi, 'tô indo já, rapidinho tô aí'],
    [/\bmais tarde\b|\bposteriormente\b|\bem outro momento\b/gi, 'depois a gente vê'],
    [/\bestava\b/gi, 'tarra'],
    [/\bestávamos\b/gi, 'távamo'],
    [/\bmuito legal\b|\blegal\b|\bbacana\b/gi, 'massa'],
    [/\bsucesso total\b|\bfoi incrível\b|\bfoi um sucesso\b/gi, 'pocou tudo'],
    [/\bvocê viu\b/gi, 'cê viu só'],
    [/\bpeixe ensopado\b/gi, 'moqueca capixaba'],
  ];

  for (const [regex, replacement] of rules) {
    translated = translated.replace(regex, replacement);
  }

  // If no slang was injected, add natural Capixaba flavor
  if (
    !translated.toLowerCase().includes('massa') &&
    !translated.toLowerCase().includes('bora ali') &&
    !translated.toLowerCase().includes('pocou') &&
    !translated.toLowerCase().includes('qual é a boa') &&
    !translated.toLowerCase().includes('pão de sal')
  ) {
    translated = `Bora ali! ${translated}, pocando tudo!`;
  }

  return translated;
}

// API endpoint: Translate formal message into authentic Capixaba dialect
app.post('/api/translate-capixaba', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Texto não informado para tradução.' });
  }

  const cleanText = text.trim();

  // If GEMINI_API_KEY is available, use Gemini 3.8 Flash for AI translation
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Você é um capixaba raiz e especialista no dialeto, gírias e sotaque autêntico do Espírito Santo (Grande Vitória, Vila Velha, Serra, Guarapari e interior capixaba).
Sua missão é traduzir a mensagem abaixo (geralmente formal, neutra ou padronizada) para o dialeto capixaba autêntico, informal, descontraído e carismático.

Regras fundamentais:
- Use gírias e expressões genuínas do ES: "massa", "pocou" / "pocar" / "pocando", "bora ali", "pão de sal" (capixaba NUNCA diz pão francês), "tarra", "qual é a boa", "tô nem aí", "coitado" (no sentido capixaba carinhoso/enfático), "rolê em Camburi", "moqueca capixaba (o resto é peixada!)".
- Mantenha a ideia central e o significado da mensagem original do usuário.
- Devolva APENAS o texto traduzido final, sem aspas, sem introdução e sem explicações.

Mensagem para traduzir:
"${cleanText}"`,
      });

      const translated = response.text?.trim();
      if (translated) {
        return res.json({
          translatedText: translated,
          originalText: cleanText,
          model: 'gemini-3.8-flash',
          source: 'gemini',
        });
      }
    } catch (apiError: any) {
      console.warn('Gemini translation error, using rule-based fallback:', apiError?.message || apiError);
    }
  }

  // Graceful rule-based Capixaba dialect fallback
  const fallbackTranslation = applyCapixabaFallbackTranslation(cleanText);
  return res.json({
    translatedText: fallbackTranslation,
    originalText: cleanText,
    source: 'fallback',
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
