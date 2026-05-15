import { Request, Response } from 'express';
import { NoteService } from '../services/noteService';

const noteService = new NoteService();

export class NoteController {
  async create(req: Request, res: Response) {
    try {
      const { title, content, color } = req.body;
      const note = await noteService.createNote(req.user!.id, title, content, color);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { archived, all } = req.query;
      const notes = await noteService.listNotes(
        req.user!.id,
        archived === 'true',
        all === 'true'
      );
      res.json(notes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Forçar o tipo como string
      const noteId = id as string;
      const note = await noteService.getNoteById(req.user!.id, noteId);
      res.json(note);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      // Forçar o tipo como string
      const noteId = id as string;
      const note = await noteService.updateNote(req.user!.id, noteId, title, content);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const noteId = id as string;
      const note = await noteService.deleteNote(req.user!.id, noteId);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async restore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Forçar o tipo como string
      const noteId = id as string;
      const note = await noteService.restoreNote(req.user!.id, noteId);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async togglePin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Forçar o tipo como string
      const noteId = id as string;
      const note = await noteService.togglePin(req.user!.id, noteId);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleArchive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Forçar o tipo como string
      const noteId = id as string;
      const note = await noteService.toggleArchive(req.user!.id, noteId);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}