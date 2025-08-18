import { Quiz, GameSession, CreateGameResponse, JoinGameResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Add timeout and better error handling to all fetch calls
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend may be slow or unreachable');
    }
    throw error;
  }
};

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  generateGuestToken: async (quizId: string) => {
    const response = await fetchWithTimeout(`${API_BASE}/auth/guest-token`, {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    });
    return response.json();
  },
};

export const api = {
  // Quiz endpoints
  quiz: {
    getAll: async (): Promise<Quiz[]> => {
      const response = await fetchWithTimeout(`${API_BASE}/quizzes`);
      return response.json();
    },

    getById: async (id: string): Promise<Quiz> => {
      const response = await fetchWithTimeout(`${API_BASE}/quizzes/${id}`);
      return response.json();
    },

    create: async (data: Partial<Quiz>): Promise<Quiz> => {
      const response = await fetchWithTimeout(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    update: async (id: string, data: Partial<Quiz>): Promise<void> => {
      const response = await fetchWithTimeout(`${API_BASE}/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (id: string): Promise<void> => {
      await fetchWithTimeout(`${API_BASE}/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
    },
  },

  // Game endpoints
  game: {
    create: async (quizId: string): Promise<CreateGameResponse> => {
      const response = await fetchWithTimeout(`${API_BASE}/games/create`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ quizId }),
      });
      return response.json();
    },

    join: async (pin: string, name: string): Promise<JoinGameResponse> => {
      const response = await fetchWithTimeout(`${API_BASE}/games/join`, {
        method: 'POST',
        body: JSON.stringify({ pin, name }),
      });
      return response.json();
    },

    getLeaderboard: async (gameId: string) => {
      const response = await fetchWithTimeout(`${API_BASE}/games/${gameId}/leaderboard`);
      return response.json();
    },
  },

  // File upload
  upload: async (file: File): Promise<{ mediaUrl: string; originalName: string }> => {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetchWithTimeout(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
    return response.json();
  },

  // AI Integration
  ai: {
    suggestCategories: async (context: string): Promise<{ suggestions: string[] }> => {
      const response = await fetchWithTimeout(`${API_BASE}/ai/suggest-categories`, {
        method: 'POST',
        body: JSON.stringify({ context }),
      });
      return response.json();
    },
  },

  // System
  health: async () => {
    const response = await fetchWithTimeout(`${API_BASE}/health`);
    return response.json();
  },
};