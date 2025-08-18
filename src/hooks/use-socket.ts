'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Host socket hook with authentication
export function useHostSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Authentication token required');
      return;
    }

    // Connect to host namespace with authentication and better error handling
    socketRef.current = io(`${SOCKET_URL}/host`, {
      auth: { token },
      timeout: 10000, // 10 second connection timeout
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Host socket connected');
    });

    socketRef.current.on('connect_error', (err) => {
      setIsConnected(false);
      setError(err.message || 'Connection failed');
      console.error('Host socket connection error:', err);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Host socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current) {
      setError('Socket not connected');
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    emit,
    on,
    socket: socketRef.current,
    isConnected,
    error
  };
}

// Player socket hook (no authentication needed)
export function usePlayerSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to player namespace with better error handling
    socketRef.current = io(`${SOCKET_URL}/player`, {
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Player socket connected');
    });

    socketRef.current.on('connect_error', (err) => {
      setIsConnected(false);
      setError(err.message || 'Connection failed');
      console.error('Player socket connection error:', err);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Player socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current) {
      setError('Socket not connected');
      return;
    }
    socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return {
    emit,
    on,
    socket: socketRef.current,
    isConnected,
    error
  };
}

// Host game management hook
export function useHostGameSocket() {
  const { emit, on, isConnected, error } = useHostSocket();

  const initGame = useCallback((gameId: string) => {
    emit('host:init_game', { gameId });
  }, [emit]);

  const startGame = useCallback((gameId: string) => {
    emit('host:start_game', { gameId });
  }, [emit]);

  const nextQuestion = useCallback((gameId: string) => {
    emit('host:next_question', { gameId });
  }, [emit]);

  const revealAnswer = useCallback((gameId: string) => {
    emit('host:reveal_answer', { gameId });
  }, [emit]);

  const endGame = useCallback((gameId: string) => {
    emit('host:end_game', { gameId });
  }, [emit]);

  return {
    initGame,
    startGame,
    nextQuestion,
    revealAnswer,
    endGame,
    on,
    isConnected,
    error,
  };
}

export function usePlayerGameSocket() {
  const { emit, on, isConnected, error } = usePlayerSocket();

  const joinGame = useCallback((pin: string, playerId: string) => {
    emit('player:join', { pin, playerId });
  }, [emit]);

  const submitAnswer = useCallback((data: {
    gameId: string;
    questionId: string;
    choiceId: string;
    timeTaken: number;
  }) => {
    emit('player:answer', data);
  }, [emit]);

  return {
    joinGame,
    submitAnswer,
    on,
    isConnected,
    error,
  };
}

// Legacy compatibility hook
export function useGameSocket() {
  return useHostGameSocket();
}