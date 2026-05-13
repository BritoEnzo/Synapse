import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Note } from '../types';
import { AILocalService } from '../services/aiLocalService';
import toast from 'react-hot-toast';

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (data: { title: string; content: string; color?: string; summary?: string; tags?: string[] }) => void;
}

const colors = ['#ffffff', '#fef3c7', '#fed7aa', '#fecaca', '#d1fae5', '#e0e7ff'];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  note,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || '#ffffff');
      setAiSummary(note.summary || '');
      setAiTags(note.tags?.map(t => t.name) || []);
    } else {
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setAiSummary('');
      setAiTags([]);
    }
  }, [note, isOpen]);

  const handleGenerateAI = async () => {
    if (!content || content.length < 30) {
      toast.error('Adicione mais conteúdo para gerar IA (mínimo 30 caracteres)');
      return;
    }

    setIsGeneratingAI(true);
    toast.loading('IA está analisando sua nota...', { id: 'ai' });

    try {
      const [summary, tags] = await Promise.all([
        AILocalService.summarizeNote(content),
        AILocalService.suggestTags(content),
      ]);

      setAiSummary(summary);
      setAiTags(tags);
      
      if (summary && !summary.includes('Erro') && !summary.includes('carregando')) {
        toast.success('IA gerou resumo e tags!', { id: 'ai' });
      } else if (summary.includes('carregando')) {
        toast.loading('Modelo ainda carregando, aguarde...', { id: 'ai' });
        setTimeout(() => toast.dismiss('ai'), 2000);
      } else {
        toast.error('Erro ao gerar IA', { id: 'ai' });
      }
    } catch (error) {
      toast.error('Erro ao gerar IA', { id: 'ai' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      title, 
      content, 
      color, 
      summary: aiSummary, 
      tags: aiTags 
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              style={{ backgroundColor: color }}
              className="rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500" />
                  <h2 className="text-lg font-semibold">
                    {note ? 'Editar Nota' : 'Nova Nota'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <input
                  type="text"
                  placeholder="Título da nota..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none placeholder:text-slate-400 mb-3"
                  autoFocus
                />

                <textarea
                  placeholder="Escreva seu conteúdo aqui..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full bg-transparent border-none focus:outline-none placeholder:text-slate-400 resize-none"
                />

                {/* Botão de IA */}
                {content.length > 20 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      {isGeneratingAI ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {isGeneratingAI ? 'IA processando...' : '🔮 Gerar resumo e tags com IA'}
                    </button>
                  </div>
                )}

                {/* Resumo gerado */}
                {aiSummary && aiSummary !== 'Adicione mais conteúdo para gerar resumo (mínimo 30 caracteres)' && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium mb-1">📝 Resumo IA</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{aiSummary}</p>
                  </div>
                )}

                {/* Tags sugeridas */}
                {aiTags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-purple-600 font-medium mb-2">🏷️ Tags sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cores */}
                <div className="flex gap-2 mt-4">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c
                          ? 'border-purple-500 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};