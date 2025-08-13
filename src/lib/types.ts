export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: Option[];
  correctAnswer: string;
  time: number;
  points: number;
  mediaUrl?: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  categories: string[];
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'published';
}

export interface GameSession {
  id: string;
  quizId: string;
  pin: string;
  status: 'lobby' | 'active' | 'finished';
  players: Player[];
  currentQuestion: number;
  startedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  selectedOption: string;
  timeToAnswer: number;
  points: number;
}

export interface CreateGameResponse {
  gameId: string;
  pin: string;
}

export interface JoinGameResponse {
  playerId: string;
  gameId: string;
}
