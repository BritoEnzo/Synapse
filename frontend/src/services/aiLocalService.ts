import { pipeline, env } from '@xenova/transformers';

// CONFIGURAÇÃO QUE FUNCIONA
env.remoteHost = 'https://cdn-lfs.huggingface.co';
env.remotePathTemplate = '/{model}/{revision}/{filename}';

// Desabilitar cache problemático
env.useBrowserCache = false;
env.useFSCache = false;

let summarizer: any = null;
let tagGenerator: any = null;
let loadingStatus: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

export class AILocalService {
  static getStatus() {
    return loadingStatus;
  }

  static async getSummarizer() {
    if (summarizer) return summarizer;
    if (loadingStatus === 'loading') return null;

    loadingStatus = 'loading';
    console.log('🔄 Iniciando download do modelo de sumarização...');
    
    try {
      // Modelo TINY (apenas 50MB) mais fácil de baixar
      summarizer = await pipeline('summarization', 'Xenova/t5-small', {
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`📥 Download: ${Math.round(progress.progress * 100)}%`);
          }
        }
      });
      loadingStatus = 'ready';
      console.log('✅ Modelo de sumarização pronto!');
      return summarizer;
    } catch (error) {
      loadingStatus = 'error';
      console.error('❌ Erro detalhado:', error);
      throw error;
    }
  }

  static async getTagGenerator() {
    if (tagGenerator) return tagGenerator;

    try {
      tagGenerator = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`📥 Download tags: ${Math.round(progress.progress * 100)}%`);
          }
        }
      });
      console.log('✅ Modelo de tags pronto!');
      return tagGenerator;
    } catch (error) {
      console.error('❌ Erro:', error);
      throw error;
    }
  }

  static async summarizeNote(content: string): Promise<string> {
    if (!content || content.length < 30) {
      return 'Adicione mais conteúdo (mínimo 30 caracteres)';
    }

    try {
      const model = await this.getSummarizer();
      if (!model) return 'Modelo carregando, aguarde...';
      
      const result = await model(content.slice(0, 500), {
        max_length: 50,
        min_length: 10,
      });
      
      return result[0]?.summary_text || 'Resumo não disponível';
    } catch (error) {
      console.error('Erro:', error);
      return 'Erro ao gerar resumo';
    }
  }

  static async suggestTags(content: string): Promise<string[]> {
    if (!content || content.length < 20) return [];

    const tagCandidates = [
      'trabalho', 'pessoal', 'estudo', 'projeto', 'ideia',
      'urgente', 'lembrete', 'tutorial', 'reunião', 'meta'
    ];

    try {
      const model = await this.getTagGenerator();
      if (!model) return [];
      
      const result = await model(content.slice(0, 500), tagCandidates);
      
      return result.scores
        .map((score: number, i: number) => ({ tag: result.labels[i], score }))
        .filter((item: any) => item.score > 0.25)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3)
        .map((item: any) => item.tag);
    } catch (error) {
      return [];
    }
  }

  static async preloadModels() {
    console.log('🚀 Pré-carregando modelos...');
    try {
      await this.getSummarizer();
      await this.getTagGenerator();
    } catch (error) {
      console.error('Falha no pré-carregamento:', error);
    }
  }
}