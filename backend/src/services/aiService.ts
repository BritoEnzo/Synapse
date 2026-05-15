import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const SYSTEM_PROMPT = `Você é um assistente especializado em análise e organização de notas pessoais em português.
Analise o conteúdo fornecido e retorne APENAS JSON válido (sem markdown, sem blocos de código, sem explicações).
O JSON deve ter exatamente três campos: summary, tags e suggestedTitle.`;

export class AIService {
  static async analyzeNote(content: string): Promise<{
    summary: string;
    tags: string[];
    suggestedTitle: string;
  }> {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analise esta nota e responda com JSON no formato exato abaixo:
{"summary":"resumo em 1-2 frases","tags":["tag1","tag2","tag3"],"suggestedTitle":"título conciso"}

Nota: "${content.slice(0, 1200)}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 256,
    });

    const text = (completion.choices[0]?.message?.content ?? '').trim();
    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        summary: parsed.summary || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
        suggestedTitle: parsed.suggestedTitle || '',
      };
    } catch {
      return { summary: '', tags: [], suggestedTitle: '' };
    }
  }
}
