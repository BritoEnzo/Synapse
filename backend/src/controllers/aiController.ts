import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

export class AIController {
  async analyzeNote(req: Request, res: Response) {
    try {
      const { content } = req.body;

      if (!content || content.trim().length < 30) {
        return res.status(400).json({
          error: 'Conteúdo muito curto (mínimo 30 caracteres)',
        });
      }

      const result = await AIService.analyzeNote(content);
      res.json(result);
    } catch (error: any) {
      console.error('AI Error:', error?.message, error?.status, JSON.stringify(error?.errorDetails));
      res.status(500).json({
        error: error?.message || 'Erro ao processar com IA. Verifique a chave GROQ_API_KEY.',
      });
    }
  }
}
