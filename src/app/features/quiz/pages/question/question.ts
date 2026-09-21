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

  readonly quizService = inject(QuizService);
  readonly router = inject(Router);

  // =========================================================
  // ESTADO DEL QUIZ
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
  // RESPONDER PREGUNTA
  // =========================================================

  answerQuestion(answerId: string): void {
    // Evitar respuestas cuando el quiz ya terminó
    if (this.isFinished()) {
      return;
    }

    this.quizService.answerQuestion(answerId);
  }

  // =========================================================
  // SIGUIENTE PREGUNTA
  // =========================================================

  nextQuestion(): void {
    // No avanzar si todavía no respondió
    if (!this.isAnswered()) {
      return;
    }

    // Avanzar usando únicamente la lógica del servicio
    this.quizService.nextQuestion();

    // El servicio es quien determina si terminó
    if (this.isFinished()) {
      this.router.navigate(['/resultado']);
    }
  }

  // =========================================================
  // VERIFICAR RESPUESTA
  // =========================================================

  isCorrectAnswer(answerId: string): boolean {
    return this.quizService.isCorrectAnswer(
      answerId
    );
  }

  // =========================================================
  // CLASE VISUAL DE RESPUESTA
  // =========================================================

  getAnswerClass(answerId: string): string {
    // Antes de responder no hay ninguna clase especial
    if (!this.isAnswered()) {
      return '';
    }

    // Respuesta correcta
    if (this.isCorrectAnswer(answerId)) {
      return 'answer-card--correct';
    }

    // Respuesta seleccionada pero incorrecta
    if (this.selectedAnswer() === answerId) {
      return 'answer-card--incorrect';
    }

    // Las demás opciones quedan deshabilitadas visualmente
    return 'answer-card--disabled';
  }

  // =========================================================
  // IMAGEN DEL PERSONAJE
  // =========================================================

  getCharacterImage(): string {
    // Mientras no responda
    if (!this.isAnswered()) {
      return '/assets/characters/thinking.webp';
    }

    const answer = this.selectedAnswer();

    // Respuesta correcta
    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {
      return '/assets/characters/happy.webp';
    }

    // Respuesta incorrecta
    return '/assets/characters/sad.webp';
  }

  // =========================================================
  // TÍTULO DEL FEEDBACK
  // =========================================================

  getFeedbackTitle(): string {
    const answer = this.selectedAnswer();

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
    const answer = this.selectedAnswer();

    // Seguridad: todavía no hay respuesta
    if (answer === null) {
      return '';
    }

    // Respuesta correcta
    if (this.isCorrectAnswer(answer)) {
      return '¡Respuesta correcta! Sigue explorando.';
    }

    // Buscar la respuesta correcta
    const correctOption =
      this.currentQuestion().options.find(
        (option) =>
          option.id ===
          this.currentQuestion().correctAnswer
      );

    return `La respuesta correcta era: ${
      correctOption?.text ?? ''
    }`;
  }
}