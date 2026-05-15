"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const noteService_1 = require("../services/noteService");
const noteService = new noteService_1.NoteService();
class NoteController {
    async create(req, res) {
        try {
            const { title, content, color } = req.body;
            const note = await noteService.createNote(req.user.id, title, content, color);
            res.status(201).json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async list(req, res) {
        try {
            const { archived, all } = req.query;
            const notes = await noteService.listNotes(req.user.id, archived === 'true', all === 'true');
            res.json(notes);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            // Forçar o tipo como string
            const noteId = id;
            const note = await noteService.getNoteById(req.user.id, noteId);
            res.json(note);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            // Forçar o tipo como string
            const noteId = id;
            const note = await noteService.updateNote(req.user.id, noteId, title, content);
            res.json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const noteId = id;
            const note = await noteService.deleteNote(req.user.id, noteId);
            res.json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async restore(req, res) {
        try {
            const { id } = req.params;
            // Forçar o tipo como string
            const noteId = id;
            const note = await noteService.restoreNote(req.user.id, noteId);
            res.json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async togglePin(req, res) {
        try {
            const { id } = req.params;
            // Forçar o tipo como string
            const noteId = id;
            const note = await noteService.togglePin(req.user.id, noteId);
            res.json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async toggleArchive(req, res) {
        try {
            const { id } = req.params;
            // Forçar o tipo como string
            const noteId = id;
            const note = await noteService.toggleArchive(req.user.id, noteId);
            res.json(note);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.NoteController = NoteController;
