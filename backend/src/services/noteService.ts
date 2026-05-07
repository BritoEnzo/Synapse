import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NoteService {
  async createNote(userId: string, title: string, content: string, color?: string) {
    return prisma.note.create({
      data: {
        title,
        content,
        color: color || '#ffffff',
        authorId: userId,
      }
    });
  }

  async listNotes(userId: string, archived?: boolean) {
    return prisma.note.findMany({
      where: {
        authorId: userId,
        deletedAt: null,
        isArchived: archived || false
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });
  }

  async getNoteById(userId: string, noteId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        authorId: userId,
        deletedAt: null
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 5
        }
      }
    });

    if (!note) {
      throw new Error('Note not found');
    }

    return note;
  }

  async updateNote(userId: string, noteId: string, title: string, content: string) {
    const oldNote = await this.getNoteById(userId, noteId);
    
    const versionCount = await prisma.noteVersion.count({
      where: { noteId }
    });
    
    await prisma.noteVersion.create({
      data: {
        noteId,
        title: oldNote.title,
        content: oldNote.content,
        version: versionCount + 1
      }
    });
    
    return prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        updatedAt: new Date()
      }
    });
  }

  async deleteNote(userId: string, noteId: string) {
    return prisma.note.update({
      where: { id: noteId },
      data: { deletedAt: new Date() }
    });
  }

  async restoreNote(userId: string, noteId: string) {
    return prisma.note.update({
      where: { id: noteId },
      data: { deletedAt: null }
    });
  }

  async togglePin(userId: string, noteId: string) {
    const note = await this.getNoteById(userId, noteId);
    return prisma.note.update({
      where: { id: noteId },
      data: { isPinned: !note.isPinned }
    });
  }

  async toggleArchive(userId: string, noteId: string) {
    const note = await this.getNoteById(userId, noteId);
    return prisma.note.update({
      where: { id: noteId },
      data: { isArchived: !note.isArchived }
    });
  }
}