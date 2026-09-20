import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-question',
  imports: [],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question {
  readonly quizService = inject(QuizService);
  readonly router = inject(Router);

  readonly currentQuestion = this.quizService.currentQuestion;
  readonly currentQuestionIndex =
    this.quizService.currentQuestionIndex;
  readonly totalQuestions =
    this.quizService.totalQuestions;
  readonly progress =
    this.quizService.progress;
  readonly score =
    this.quizService.score;
  readonly selectedAnswer =
    this.quizService.selectedAnswer;
  readonly isAnswered =
    this.quizService.isAnswered;
  readonly isFinished =
    this.quizService.isFinished;

  constructor() {
    this.quizService.startQuiz();
  }

  answerQuestion(answerId: string): void {
    this.quizService.answerQuestion(answerId);
  }

  nextQuestion(): void {
    const isLastQuestion =
      this.currentQuestionIndex() ===
      this.totalQuestions() - 1;

    this.quizService.nextQuestion();

    if (isLastQuestion) {
      this.router.navigate(['/resultado']);
    }
  }

  isCorrectAnswer(answerId: string): boolean {
    return this.quizService.isCorrectAnswer(answerId);
  }

  getAnswerClass(answerId: string): string {
    if (!this.isAnswered()) {
      return '';
    }

    if (this.isCorrectAnswer(answerId)) {
      return 'answer-card--correct';
    }

    if (this.selectedAnswer() === answerId) {
      return 'answer-card--incorrect';
    }

    return 'answer-card--disabled';
  }

  getCharacterImage(): string {
    if (!this.isAnswered()) {
      return '/assets/characters/thinking.webp';
    }

    if (
      this.selectedAnswer() &&
      this.isCorrectAnswer(this.selectedAnswer()!)
    ) {
      return '/assets/characters/happy.webp';
    }

    return '/assets/characters/sad.webp';
  }

  getFeedbackTitle(): string {
    if (
      this.isCorrectAnswer(this.selectedAnswer()!)
    ) {
      return '¡Muy bien!';
    }

    return '¡Casi!';
  }

  getFeedbackText(): string {
    if (
      this.isCorrectAnswer(this.selectedAnswer()!)
    ) {
      return '¡Respuesta correcta! Sigue explorando.';
    }

    const correctOption =
      this.currentQuestion().options.find(
        (option) =>
          option.id ===
          this.currentQuestion().correctAnswer
      );

    return `La respuesta correcta era: ${correctOption?.text}`;
  }
}