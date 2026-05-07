export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;  // ← ADICIONAR ESTA LINHA
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
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