import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Note } from '../types';
import { ClaudeAIService } from '../services/claudeAIService';
import { getContrastColors } from '../utils/colorUtils';
import toast from 'react-hot-toast';

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (data: { title: string; content: string; color?: string; summary?: string; tags?: string[] }) => void;
}

const colors = ['#ffffff', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373'];

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
  const [suggestedTitle, setSuggestedTitle] = useState('');

  const k = getContrastColors(color);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || '#ffffff');
      setAiSummary(note.summary || '');
      setAiTags(note.tags?.map(t => t.name) || []);
      setSuggestedTitle('');
    } else {
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setAiSummary('');
      setAiTags([]);
      setSuggestedTitle('');
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
      const result = await ClaudeAIService.analyzeNote(content);
      setAiSummary(result.summary);
      setAiTags(result.tags);
      setSuggestedTitle(result.suggestedTitle);
      toast.success('IA gerou resumo, tags e título!', { id: 'ai' });
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao conectar com a IA';
      toast.error(msg, { id: 'ai' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content, color, summary: aiSummary, tags: aiTags });
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              style={{ backgroundColor: color }}
              className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div
                style={{ borderBottomColor: k.divider }}
                className="flex justify-between items-center px-6 py-4 border-b bg-black/5"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={18} style={{ color: k.subtext }} />
                  <h2 style={{ color: k.text }} className="text-base font-semibold">
                    {note ? 'Editar Nota' : 'Nova Nota'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  style={{ color: k.subtext }}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Título */}
                <div className="relative mb-1">
                  <input
                    type="text"
                    placeholder="Título da nota..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ color: k.text }}
                    className="w-full text-xl font-bold bg-transparent border-none focus:outline-none placeholder:text-current/30 pr-32"
                    autoFocus
                  />
                  {suggestedTitle && suggestedTitle !== title && (
                    <button
                      type="button"
                      onClick={() => setTitle(suggestedTitle)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-xs border rounded-full px-2 py-0.5 flex items-center gap-1 transition-colors bg-white/80 text-gray-500 hover:text-gray-900 border-gray-300"
                    >
                      <Wand2 size={10} />
                      Usar sugestão
                    </button>
                  )}
                </div>

                {suggestedTitle && suggestedTitle !== title && (
                  <p style={{ color: k.muted }} className="text-xs mb-3 pl-0.5">
                    Sugestão IA: <span style={{ color: k.subtext }} className="font-medium">"{suggestedTitle}"</span>
                  </p>
                )}

                <div style={{ backgroundColor: k.divider }} className="w-full h-px mb-4" />

                <textarea
                  placeholder="Escreva seu conteúdo aqui..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  style={{ color: k.subtext }}
                  className="w-full bg-transparent border-none focus:outline-none placeholder:text-current/30 resize-none leading-relaxed"
                />

                {/* Botão de IA */}
                {content.length > 20 && (
                  <div style={{ borderTopColor: k.divider }} className="mt-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      style={{ color: k.subtext, backgroundColor: k.badgeBg }}
                      className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg hover:opacity-80"
                    >
                      {isGeneratingAI ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {isGeneratingAI ? 'IA processando...' : 'Analisar com IA'}
                    </button>
                  </div>
                )}

                {/* Resumo gerado */}
                {aiSummary && (
                  <div className="mt-3 p-3 bg-gray-900 rounded-xl">
                    <p className="text-xs text-gray-300 font-medium mb-1 flex items-center gap-1">
                      <Sparkles size={10} />
                      Resumo gerado por IA
                    </p>
                    <p className="text-sm text-white leading-relaxed">{aiSummary}</p>
                  </div>
                )}

                {/* Tags sugeridas */}
                {aiTags.length > 0 && (
                  <div className="mt-3">
                    <p style={{ color: k.muted }} className="text-xs font-medium mb-2">Tags sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-gray-900 text-white text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paleta de cores */}
                <div style={{ borderTopColor: k.divider }} className="flex items-center gap-2 mt-5 pt-4 border-t">
                  <span style={{ color: k.muted }} className="text-xs font-medium mr-1">Cor:</span>
                  {colors.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === hex ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: hex,
                        borderColor: color === hex ? k.text : k.divider,
                      }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={onClose}
                    style={{ color: k.subtext, backgroundColor: k.badgeBg }}
                    className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
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
