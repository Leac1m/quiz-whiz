import { Quiz, GameSession, CreateGameResponse, JoinGameResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Add timeout to all fetch calls:
const withTimeout = (response: Promise<Response>) => {
  return Promise.race([
    response,
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 10000)
    ),
  ]);
};

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = withTimeout(
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
    );
    if (!(await response).ok) throw new Error('Login failed');
    return (await response).json();
  },

  generateGuestToken: async (quizId: string) => {
    const response = withTimeout(
      fetch(`${API_BASE}/auth/guest-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      })
    );
    if (!(await response).ok) throw new Error('Failed to generate guest token');
    return (await response).json();
  },
};

export const api = {
  // Quiz endpoints
  quiz: {
    getAll: async (): Promise<Quiz[]> => {
      const response = withTimeout(fetch(`${API_BASE}/quizzes`));
      if (!(await response).ok) throw new Error('Failed to fetch quizzes');
      return (await response).json();
    },

    getById: async (id: string): Promise<Quiz> => {
      const response = withTimeout(fetch(`${API_BASE}/quizzes/${id}`));
      if (!(await response).ok) throw new Error('Failed to fetch quiz');
      return (await response).json();
    },

    create: async (data: Partial<Quiz>): Promise<Quiz> => {
      const response = withTimeout(
        fetch(`${API_BASE}/quizzes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })
      );
      if (!(await response).ok) throw new Error('Failed to create quiz');
      return (await response).json();
    },

    update: async (id: string, data: Partial<Quiz>): Promise<{ message: string }> => {
      const response = withTimeout(
        fetch(`${API_BASE}/quizzes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        })
      );
      if (!(await response).ok) throw new Error('Failed to update quiz');
      return (await response).json();
    },

    delete: async (id: string): Promise<{ message: string }> => {
      const response = withTimeout(
        fetch(`${API_BASE}/quizzes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        })
      );
      if (!(await response).ok) throw new Error('Failed to delete quiz');
      return (await response).json();
    },
  },

  // Game endpoints
  game: {
    create: async (quizId: string): Promise<CreateGameResponse> => {
      const response = withTimeout(
        fetch(`${API_BASE}/games/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId }),
        })
      );
      console.log(response);
      if (!(await response).ok) throw new Error('Failed to create game');
      return (await response).json();
    },

    join: async (pin: string, name: string): Promise<JoinGameResponse> => {
      const response = withTimeout(
        fetch(`${API_BASE}/games/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, name }),
        })
      );
      if (!(await response).ok) throw new Error('Failed to join game');
      return (await response).json();
    },

    getLeaderboard: async (gameId: string) => {
      const response = withTimeout(fetch(`${API_BASE}/games/${gameId}/leaderboard`));
      if (!(await response).ok) throw new Error('Failed to fetch leaderboard');
      return (await response).json();
    },
  },

  // File upload
  upload: async (file: File): Promise<{ mediaUrl: string; originalName: string }> => {
    const formData = new FormData();
    formData.append('media', file);

    const response = withTimeout(
      fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })
    );
    if (!(await response).ok) throw new Error('Failed to upload file');
    return (await response).json();
  },

  // AI Integration
  ai: {
    suggestCategories: async (context: string): Promise<{ suggestions: string[] }> => {
      const response = withTimeout(
        fetch(`${API_BASE}/ai/suggest-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context }),
        })
      );
      if (!(await response).ok) throw new Error('Failed to get suggestions');
      return (await response).json();
    },
  },

  // System
  health: async () => {
    const response = withTimeout(fetch(`${API_BASE}/health`));
    if (!(await response).ok) throw new Error('Health check failed');
    return (await response).json();
  },
};