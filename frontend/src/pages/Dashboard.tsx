import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Archive, Trash2, StickyNote, Pin, Brain } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { noteService } from '../services/noteService';
import { Note } from '../types';
import toast from 'react-hot-toast';

type View = 'active' | 'archived' | 'trash';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<View>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getAll();
      setNotes(data);
    } catch {
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => ({
    active: notes.filter(n => !n.isArchived && !n.deletedAt).length,
    archived: notes.filter(n => n.isArchived && !n.deletedAt).length,
    trash: notes.filter(n => !!n.deletedAt).length,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    let list = notes.filter(n => {
      if (view === 'trash') return !!n.deletedAt;
      if (view === 'archived') return n.isArchived && !n.deletedAt;
      return !n.isArchived && !n.deletedAt;
    });
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notes, view, searchTerm]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const handleSaveNote = async (data: { title: string; content: string; color?: string; summary?: string; tags?: string[] }) => {
    try {
      if (editingNote) {
        const updated = await noteService.update(editingNote.id, data);
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        toast.success('Nota atualizada!');
      } else {
        const created = await noteService.create(data);
        setNotes(prev => [created, ...prev]);
        toast.success('Nota criada!');
      }
      setModalOpen(false);
      setEditingNote(null);
    } catch {
      toast.error('Erro ao salvar nota');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await noteService.delete(id);
      if ((result as any).permanentlyDeleted) {
        setNotes(prev => prev.filter(n => n.id !== id));
        toast.success('Nota excluída permanentemente');
      } else {
        setNotes(prev => prev.map(n => n.id === (result as any).id ? result as any : n));
        toast.success('Nota movida para lixeira');
      }
    } catch {
      toast.error('Erro ao deletar');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await noteService.togglePin(id);
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    } catch {
      toast.error('Erro ao fixar nota');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      const updated = await noteService.toggleArchive(id);
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      toast.success(updated.isArchived ? 'Nota arquivada' : 'Nota desarquivada');
    } catch {
      toast.error('Erro ao arquivar');
    }
  };

  const viewConfig: Record<View, { label: string; icon: React.ReactNode; empty: string }> = {
    active: { label: 'Minhas Notas', icon: <StickyNote size={16} />, empty: 'Nenhuma nota ainda. Crie a primeira!' },
    archived: { label: 'Arquivadas', icon: <Archive size={16} />, empty: 'Nenhuma nota arquivada.' },
    trash: { label: 'Lixeira', icon: <Trash2 size={16} />, empty: 'Lixeira vazia.' },
  };

  return (
    <MainLayout>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          { key: 'active', label: 'Ativas', icon: <StickyNote size={20} />, color: 'from-gray-800 to-gray-900' },
          { key: 'archived', label: 'Arquivadas', icon: <Archive size={20} />, color: 'from-gray-700 to-gray-800' },
          { key: 'trash', label: 'Lixeira', icon: <Trash2 size={20} />, color: 'from-gray-600 to-gray-700' },
        ] as const).map(({ key, label, icon, color }) => (
          <motion.button
            key={key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView(key)}
            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-5 text-left transition-all shadow-lg ${
              view === key ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="opacity-70">{icon}</span>
              <span className="text-3xl font-bold">{counts[key]}</span>
            </div>
            <p className="text-sm font-medium opacity-80">{label}</p>
          </motion.button>
        ))}
      </div>

      {/* Search + New Note */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas por título ou conteúdo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm text-sm"
          />
        </div>
        {view !== 'trash' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setEditingNote(null); setModalOpen(true); }}
            className="px-5 py-3 bg-gray-900 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Nova Nota
          </motion.button>
        )}
      </div>

      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400">{viewConfig[view].icon}</span>
        <h2 className="text-base font-semibold text-gray-700">{viewConfig[view].label}</h2>
        {filteredNotes.length > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full font-medium">
            {filteredNotes.length}
          </span>
        )}
        <div className="flex-1 h-px bg-gray-200 ml-2" />
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Carregando notas...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Brain size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">{viewConfig[view].empty}</p>
          {view === 'active' && (
            <button
              onClick={() => { setEditingNote(null); setModalOpen(true); }}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Criar nota
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Seção fixadas — aparece em qualquer view que tenha notas fixadas */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={13} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fixadas</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <AnimatePresence>
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={n => { setEditingNote(n); setModalOpen(true); }}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Notas não fixadas */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote size={13} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Outras</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <AnimatePresence>
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={n => { setEditingNote(n); setModalOpen(true); }}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      <NoteModal
        isOpen={modalOpen}
        note={editingNote}
        onClose={() => { setModalOpen(false); setEditingNote(null); }}
        onSave={handleSaveNote}
      />
    </MainLayout>
  );
}
