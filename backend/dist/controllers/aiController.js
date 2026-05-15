"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
class AIController {
    async analyzeNote(req, res) {
        try {
            const { content } = req.body;
            if (!content || content.trim().length < 30) {
                return res.status(400).json({
                    error: 'Conteúdo muito curto (mínimo 30 caracteres)',
                });
            }
            const result = await aiService_1.AIService.analyzeNote(content);
            res.json(result);
        }
        catch (error) {
            console.error('AI Error:', error?.message, error?.status, JSON.stringify(error?.errorDetails));
            res.status(500).json({
                error: error?.message || 'Erro ao processar com IA. Verifique a chave GROQ_API_KEY.',
            });
        }
    }
}
exports.AIController = AIController;
