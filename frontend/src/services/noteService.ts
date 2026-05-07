import api from './api';
import { Note } from '../types';

export const noteService = {
  async getAll(): Promise<Note[]> {
    const response = await api.get('/notes');
    return response.data;
  },

  async getById(id: string): Promise<Note> {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  async create(data: { title: string; content: string; color?: string }): Promise<Note> {
    const response = await api.post('/notes', data);
    return response.data;
  },

  async update(id: string, data: { title: string; content: string }): Promise<Note> {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async restore(id: string): Promise<Note> {
    const response = await api.post(`/notes/${id}/restore`);
    return response.data;
  },

  async togglePin(id: string): Promise<Note> {
    const response = await api.post(`/notes/${id}/pin`);
    return response.data;
  },

  async toggleArchive(id: string): Promise<Note> {
    const response = await api.post(`/notes/${id}/archive`);
    return response.data;
  }
};