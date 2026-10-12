export interface TranslateResult {
  translatedText: string;
  originalText: string;
  source?: 'gemini' | 'fallback';
  model?: string;
}

export async function translateToCapixaba(text: string): Promise<TranslateResult> {
  const response = await fetch('/api/translate-capixaba', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Falha ao comunicar com o tradutor Capixaba IA.');
  }

  const data: TranslateResult = await response.json();
  return data;
}
