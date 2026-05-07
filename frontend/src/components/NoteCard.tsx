import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Archive, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { Note } from '../types';

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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{ backgroundColor: note.color || '#ffffff' }}
      className="rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-slate-200 dark:border-slate-700"
    >
      {/* Conteúdo da nota */}
      <div className="p-4 cursor-pointer" onClick={() => onEdit(note)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
            {note.title || 'Sem título'}
          </h3>
          {note.isPinned && (
            <Pin size={14} className="text-purple-500 fill-purple-500" />
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {note.content || 'Clique para editar...'}
        </p>
        <div className="mt-3 text-xs text-slate-400">
          {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Ações */}
      <div className="flex border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <button
          onClick={() => onTogglePin(note.id)}
          className={`flex-1 py-2 text-xs flex items-center justify-center gap-1 transition-colors ${
            note.isPinned
              ? 'text-purple-500 hover:bg-purple-50'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Pin size={12} />
          {note.isPinned ? 'Fixada' : 'Fixar'}
        </button>
        <button
          onClick={() => onToggleArchive(note.id)}
          className="flex-1 py-2 text-xs flex items-center justify-center gap-1 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Archive size={12} />
          Arquivar
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="flex-1 py-2 text-xs flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Deletar
        </button>
      </div>
    </motion.div>
  );
};