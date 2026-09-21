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
  // =========================================================
  // DEPENDENCIAS
  // =========================================================

  readonly quizService =
    inject(QuizService);

  readonly router =
    inject(Router);

  // =========================================================
  // ESTADO
  // =========================================================

  readonly currentQuestion =
    this.quizService.currentQuestion;

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

  // =========================================================
  // RESPONDER
  // =========================================================

  answerQuestion(
    answerId: string
  ): void {
    if (this.isFinished()) {
      return;
    }

    this.quizService.answerQuestion(
      answerId
    );
  }

  // =========================================================
  // SIGUIENTE
  // =========================================================

  nextQuestion(): void {
    if (!this.isAnswered()) {
      return;
    }

    this.quizService.nextQuestion();

    /*
     * No calculamos aquí si es la última pregunta.
     * QuizService es la única fuente de verdad.
     */

    if (this.isFinished()) {
      this.router.navigate([
        '/resultado',
      ]);
    }
  }

  // =========================================================
  // RESPUESTA CORRECTA
  // =========================================================

  isCorrectAnswer(
    answerId: string
  ): boolean {
    return this.quizService.isCorrectAnswer(
      answerId
    );
  }

  // =========================================================
  // CLASE DE RESPUESTA
  // =========================================================

  getAnswerClass(
    answerId: string
  ): string {
    if (!this.isAnswered()) {
      return '';
    }

    if (
      this.isCorrectAnswer(answerId)
    ) {
      return 'answer-card--correct';
    }

    if (
      this.selectedAnswer() ===
      answerId
    ) {
      return 'answer-card--incorrect';
    }

    return 'answer-card--disabled';
  }

  // =========================================================
  // PERSONAJE
  // =========================================================

  getCharacterImage(): string {
    if (!this.isAnswered()) {
      return '/assets/characters/thinking.webp';
    }

    const answer =
      this.selectedAnswer();

    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {
      return '/assets/characters/happy.webp';
    }

    return '/assets/characters/sad.webp';
  }

  // =========================================================
  // TÍTULO DEL FEEDBACK
  // =========================================================

  getFeedbackTitle(): string {
    const answer =
      this.selectedAnswer();

    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {
      return '¡Muy bien!';
    }

    return '¡Casi!';
  }

  // =========================================================
  // TEXTO DEL FEEDBACK
  // =========================================================

  getFeedbackText(): string {
    const answer =
      this.selectedAnswer();

    if (answer === null) {
      return '';
    }

    if (
      this.isCorrectAnswer(answer)
    ) {
      return '¡Respuesta correcta! Sigue explorando.';
    }

    const correctOption =
      this.currentQuestion()
        .options.find(
          (option) =>
            option.id ===
            this.currentQuestion()
              .correctAnswer
        );

    return `La respuesta correcta era: ${
      correctOption?.text ?? ''
    }`;
  }
}