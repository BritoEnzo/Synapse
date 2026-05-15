"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NoteService {
    async createNote(userId, title, content, color) {
        return prisma.note.create({
            data: {
                title,
                content,
                color: color || '#ffffff',
                authorId: userId,
            }
        });
    }
    async listNotes(userId, archived, all) {
        if (all) {
            return prisma.note.findMany({
                where: { authorId: userId },
                orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
            });
        }
        return prisma.note.findMany({
            where: {
                authorId: userId,
                deletedAt: null,
                isArchived: archived || false,
            },
            orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        });
    }
    async getNoteById(userId, noteId) {
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
    async updateNote(userId, noteId, title, content) {
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
    async deleteNote(userId, noteId) {
        const note = await prisma.note.findFirst({ where: { id: noteId, authorId: userId } });
        if (!note)
            throw new Error('Note not found');
        if (note.deletedAt) {
            await prisma.note.delete({ where: { id: noteId } });
            return { id: noteId, permanentlyDeleted: true };
        }
        return prisma.note.update({
            where: { id: noteId },
            data: { deletedAt: new Date() },
        });
    }
    async restoreNote(userId, noteId) {
        return prisma.note.update({
            where: { id: noteId },
            data: { deletedAt: null }
        });
    }
    async togglePin(userId, noteId) {
        const note = await this.getNoteById(userId, noteId);
        return prisma.note.update({
            where: { id: noteId },
            data: { isPinned: !note.isPinned }
        });
    }
    async toggleArchive(userId, noteId) {
        const note = await this.getNoteById(userId, noteId);
        return prisma.note.update({
            where: { id: noteId },
            data: { isArchived: !note.isArchived }
        });
    }
}
exports.NoteService = NoteService;
