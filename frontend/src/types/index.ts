export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;           // ← ADICIONADO
  isPinned: boolean;
  isArchived: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tags: Tag[];                // ← ADICIONADO
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}