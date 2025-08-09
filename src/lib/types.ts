export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: { id: string; text: string }[];
  correctAnswer: string; // Will be option id
  time: number;
  points: number;
  mediaUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  categories: string[];
  questions: Question[];
}
