import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Archive, Trash2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { noteService } from '../services/noteService';
import { Note } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [showArchived, showTrash]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getAll();
      setNotes(data);
    } catch (error) {
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (showTrash) {
      filtered = filtered.filter((n) => n.deletedAt);
    } else if (showArchived) {
      filtered = filtered.filter((n) => n.isArchived && !n.deletedAt);
    } else {
      filtered = filtered.filter((n) => !n.isArchived && !n.deletedAt);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const handleSaveNote = async (data: { title: string; content: string; color?: string }) => {
    try {
      if (editingNote) {
        const updated = await noteService.update(editingNote.id, data);
        setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
        toast.success('Nota atualizada!');
      } else {
        const created = await noteService.create(data);
        setNotes([created, ...notes]);
        toast.success('Nota criada!');
      }
      setModalOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast.error('Erro ao salvar nota');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await noteService.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
      toast.success('Nota movida para lixeira');
    } catch (error) {
      toast.error('Erro ao deletar');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await noteService.togglePin(id);
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
    } catch (error) {
      toast.error('Erro ao fixar nota');
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      const updated = await noteService.toggleArchive(id);
      setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
      toast.success(updated.isArchived ? 'Nota arquivada' : 'Nota desarquivada');
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {showTrash ? '🗑️ Lixeira' : showArchived ? '📦 Arquivo' : '📝 Minhas Notas'}
          </h2>
          <p className="text-slate-500 text-sm">
            {filteredNotes.length} nota{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => {
              setShowArchived(false);
              setShowTrash(false);
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              !showArchived && !showTrash
                ? 'bg-purple-100 text-purple-600'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Ativas
          </button>

          <button
            onClick={() => {
              setShowArchived(true);
              setShowTrash(false);
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              showArchived && !showTrash
                ? 'bg-purple-100 text-purple-600'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Archive size={18} />
          </button>

          <button
            onClick={() => {
              setShowArchived(false);
              setShowTrash(true);
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              showTrash
                ? 'bg-red-100 text-red-600'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Trash2 size={18} />
          </button>

          {!showTrash && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingNote(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <Plus size={18} />
              Nova Nota
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400">Nenhuma nota encontrada</p>
          {!showTrash && !showArchived && (
            <button
              onClick={() => {
                setEditingNote(null);
                setModalOpen(true);
              }}
              className="mt-4 text-purple-500 hover:underline"
            >
              Criar sua primeira nota →
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && !showTrash && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <span>📌 Fixadas</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(note) => {
                        setEditingNote(note);
                        setModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && !showTrash && (
                <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <span>📄 Outras</span>
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(note) => {
                        setEditingNote(note);
                        setModalOpen(true);
                      }}
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
        onClose={() => {
          setModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />
    </MainLayout>
  );
}