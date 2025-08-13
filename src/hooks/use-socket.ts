'use client';

import { useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
    
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  return { emit, on, socket: socketRef.current };
}

// Specific game socket hook
export function useGameSocket(gameId?: string) {
  const { emit, on } = useSocket();

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

  const joinGame = useCallback((pin: string, name: string, playerId: string) => {
    emit('player:join', { pin, name, playerId });
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
    // Host actions
    initGame,
    startGame,
    nextQuestion,
    revealAnswer,
    endGame,
    
    // Player actions
    joinGame,
    submitAnswer,
    
    // Event listeners
    on,
  };
}