import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { Router } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question implements OnInit, OnDestroy {
  readonly quizService = inject(QuizService);
  readonly router = inject(Router);

  // ==========================================
  // ESTADO COMPARTIDO
  // ==========================================

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

  // Tiempo para leer el feedback antes de avanzar.
  readonly autoAdvanceSeconds = 6;

  private advanceTimer?: ReturnType<typeof setTimeout>;
  private destroyed = false;

  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {
    // No reiniciar una aventura ya terminada al entrar aquí.
    if (this.isFinished()) {
      void this.router.navigate(['/resultado']);
      return;
    }

    // El servicio conserva el intento si ya fue iniciado.
    this.quizService.startQuiz();

    // Si vuelve desde el mapa con una respuesta registrada,
    // conservarla y reanudar el avance.
    if (this.isAnswered()) {
      this.scheduleNextQuestion();
    }
  }

  // ==========================================
  // RESPONDER
  // ==========================================

  answerQuestion(answerId: string): void {
    if (
      this.destroyed ||
      this.isAnswered() ||
      this.isFinished()
    ) {
      return;
    }

    // Aceptar solo opciones de la pregunta actual.
    const optionExists = this.currentQuestion()
      .options.some((option) => option.id === answerId);

    if (!optionExists) {
      return;
    }

    this.quizService.answerQuestion(answerId);

    if (this.isAnswered()) {
      this.scheduleNextQuestion();
    }
  }

  // ==========================================
  // AVANCE AUTOMÁTICO
  // ==========================================

  private scheduleNextQuestion(): void {
    this.clearAdvanceTimer();

    const answeredIndex = this.currentQuestionIndex();
    const answeredQuestion = this.currentQuestion();

    this.advanceTimer = setTimeout(() => {
      this.advanceTimer = undefined;

      // No aplicar un temporizador a otra pregunta.
      if (
        this.destroyed ||
        this.isFinished() ||
        !this.isAnswered() ||
        this.currentQuestionIndex() !== answeredIndex ||
        this.currentQuestion() !== answeredQuestion
      ) {
        return;
      }

      this.nextQuestion();
    }, this.autoAdvanceSeconds * 1000);
  }

  // ==========================================
  // AVANCE MANUAL O AUTOMÁTICO
  // ==========================================

  nextQuestion(): void {
    // Si se pulsa el botón, cancelar el avance pendiente.
    this.clearAdvanceTimer();

    if (this.destroyed) {
      return;
    }

    if (this.isFinished()) {
      void this.router.navigate(['/resultado']);
      return;
    }

    if (!this.isAnswered()) {
      return;
    }

    // El servicio incrementa el índice y limpia el feedback.
    this.quizService.nextQuestion();

    if (this.isFinished()) {
      void this.router.navigate(['/resultado']);
    }
  }

  // ==========================================
  // VOLVER AL MAPA
  // ==========================================

  goToMap(): void {
    this.clearAdvanceTimer();
    void this.router.navigate(['/mapa']);
  }

  // ==========================================
  // ESTADO DE LAS RESPUESTAS
  // ==========================================

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

  // ==========================================
  // PERSONAJE
  // ==========================================

  getCharacterImage(): string {
    if (!this.isAnswered()) {
      return '/assets/characters/thinking.webp';
    }

    const answer = this.selectedAnswer();

    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {
      return '/assets/characters/happy.webp';
    }

    return '/assets/characters/sad.webp';
  }

  // ==========================================
  // FEEDBACK
  // ==========================================

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

  getFeedbackText(): string {
    const answer = this.selectedAnswer();

    if (answer === null) {
      return '';
    }

    if (this.isCorrectAnswer(answer)) {
      return '¡Respuesta correcta! Sigue explorando.';
    }

    const question = this.currentQuestion();

    const correctOption = question.options.find(
      (option) => option.id === question.correctAnswer
    );

    return `La respuesta correcta era: ${
      correctOption?.text ?? ''
    }`;
  }

  // ==========================================
  // LIMPIEZA
  // ==========================================

  private clearAdvanceTimer(): void {
    if (this.advanceTimer !== undefined) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearAdvanceTimer();
  }
}