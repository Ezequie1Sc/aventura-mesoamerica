import { Answer } from './answer.model';

export interface Question {
  id: number;
  question: string;
  options: Answer[];
  correctAnswer: string;
  explanation: string;
}