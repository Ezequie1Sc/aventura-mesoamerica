import {
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { Router } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';
import { AudioService } from '../../../../core/services/audio.service';

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
  readonly audioService = inject(AudioService);

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

  readonly autoAdvanceSeconds = 6;

  private advanceTimer?: ReturnType<typeof setTimeout>;

  private destroyed = false;

  ngOnInit(): void {
    if (this.isFinished()) {
      void this.router.navigate(['/resultado']);
      return;
    }

    this.quizService.startQuiz();
  }

  answerQuestion(answerId: string): void {
    if (
      this.destroyed ||
      this.isAnswered() ||
      this.isFinished()
    ) {
      return;
    }

    const optionExists =
      this.currentQuestion().options.some(
        (option) => option.id === answerId
      );

    if (!optionExists) {
      return;
    }

    /*
     * Sonido de selección.
     */
    this.audioService.playSelect();

    /*
     * Registramos la respuesta.
     */
    this.quizService.answerQuestion(answerId);

    /*
     * Reproducimos el sonido dependiendo
     * de si la respuesta fue correcta o incorrecta.
     */
    if (this.isCorrectAnswer(answerId)) {
      this.audioService.playCorrect();
    } else {
      this.audioService.playIncorrect();
    }

    /*
     * Programamos el avance automático.
     */
    if (this.isAnswered()) {
      this.scheduleNextQuestion();
    }
  }

  private scheduleNextQuestion(): void {
    this.clearAdvanceTimer();

    const answeredIndex =
      this.currentQuestionIndex();

    const answeredQuestion =
      this.currentQuestion();

    this.advanceTimer = setTimeout(() => {
      this.advanceTimer = undefined;

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

  nextQuestion(): void {
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

    /*
     * Sonido de transición.
     */
    this.audioService.playNext();

    /*
     * Avanzamos el estado interno del quiz.
     */
    this.quizService.nextQuestion();

    /*
     * Si terminamos el quiz,
     * vamos directamente al resultado.
     */
    if (this.isFinished()) {
      void this.router.navigate(['/resultado']);
      return;
    }

    /*
     * Volvemos al mapa.
     */
    void this.router.navigate(['/mapa']);
  }

  goToMap(): void {
    this.clearAdvanceTimer();

    void this.router.navigate(['/mapa']);
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

    const answer = this.selectedAnswer();

    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {
      return '/assets/characters/happy.webp';
    }

    return '/assets/characters/sad.webp';
  }

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

    const correctOption =
      question.options.find(
        (option) =>
          option.id === question.correctAnswer
      );

    return `La respuesta correcta era: ${
      correctOption?.text ?? ''
    }`;
  }

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