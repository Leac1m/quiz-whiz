import { Quiz, GameSession, CreateGameResponse, JoinGameResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:3001/api';

export const api = {
  // Quiz endpoints
  quiz: {
    getAll: async (): Promise<Quiz[]> => {
      const response = await fetch(`${API_BASE}/quizzes`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return response.json();
    },

    getById: async (id: string): Promise<Quiz> => {
      const response = await fetch(`${API_BASE}/quizzes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch quiz');
      return response.json();
    },

    create: async (data: Partial<Quiz>): Promise<Quiz> => {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      return response.json();
    },

    update: async (id: string, data: Partial<Quiz>): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update quiz');
      return response.json();
    },

    delete: async (id: string): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete quiz');
      return response.json();
    },
  },

  // Game endpoints
  game: {
    create: async (quizId: string): Promise<CreateGameResponse> => {
      const response = await fetch(`${API_BASE}/games/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      });
      console.log(response);
      if (!response.ok) throw new Error('Failed to create game');
      return response.json();
    },

    join: async (pin: string, name: string): Promise<JoinGameResponse> => {
      const response = await fetch(`${API_BASE}/games/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, name }),
      });
      if (!response.ok) throw new Error('Failed to join game');
      return response.json();
    },

    getLeaderboard: async (gameId: string) => {
      const response = await fetch(`${API_BASE}/games/${gameId}/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  },

  // File upload
  upload: async (file: File): Promise<{ mediaUrl: string; originalName: string }> => {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
  },

  // AI Integration
  ai: {
    suggestCategories: async (context: string): Promise<{ suggestions: string[] }> => {
      const response = await fetch(`${API_BASE}/ai/suggest-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      if (!response.ok) throw new Error('Failed to get suggestions');
      return response.json();
    },
  },

  // System
  health: async () => {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
};