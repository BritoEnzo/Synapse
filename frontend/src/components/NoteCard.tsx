import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Archive, Trash2, Sparkles } from 'lucide-react';
import { Note } from '../types';
import { getContrastColors } from '../utils/colorUtils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}) => {
  const hasSummary = note.summary && note.summary.length > 0 && !note.summary.includes('carregando');
  const displayContent = hasSummary ? note.summary : note.content;
  const c = getContrastColors(note.color || '#ffffff');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{ backgroundColor: note.color || '#ffffff' }}
      className="rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-300 border-l-4 border-l-gray-900 cursor-pointer flex flex-col h-full"
      onClick={() => onEdit(note)}
    >
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1">
            <h3
              style={{ color: c.text }}
              className="font-semibold line-clamp-1"
            >
              {note.title || 'Sem título'}
            </h3>
            {hasSummary && (
              <Sparkles size={14} style={{ color: c.muted }} className="flex-shrink-0" />
            )}
          </div>
          {note.isPinned && (
            <Pin size={14} style={{ color: c.text }} className="flex-shrink-0 ml-2 fill-current" />
          )}
        </div>

        <p style={{ color: c.subtext }} className="text-sm line-clamp-3">
          {displayContent || 'Clique para editar...'}
        </p>

        {hasSummary && (
          <div className="mt-2">
            <span
              style={{ backgroundColor: c.badgeBg, color: c.badgeText }}
              className="text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1"
            >
              <Sparkles size={10} />
              Resumo IA
            </span>
          </div>
        )}

        <div style={{ color: c.muted }} className="mt-3 text-xs">
          {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div
        style={{ backgroundColor: c.actionBar, borderTopColor: c.divider }}
        className="flex border-t"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
          style={{ color: note.isPinned ? c.text : c.actionText }}
          className="flex-1 py-2 text-xs flex items-center justify-center gap-1 transition-colors hover:bg-black/5"
        >
          <Pin size={12} />
          {note.isPinned ? 'Fixada' : 'Fixar'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleArchive(note.id); }}
          style={{ color: c.actionText }}
          className="flex-1 py-2 text-xs flex items-center justify-center gap-1 transition-colors hover:bg-black/5"
        >
          <Archive size={12} />
          Arquivar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="flex-1 py-2 text-xs flex items-center justify-center gap-1 text-red-500 transition-colors hover:bg-red-500/10"
        >
          <Trash2 size={12} />
          Deletar
        </button>
      </div>
    </motion.div>
  );
};
