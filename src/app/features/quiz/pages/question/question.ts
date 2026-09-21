import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
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
export class Question
  implements OnInit, OnDestroy
{
  /*
   * ========================================
   * DEPENDENCIES
   * ========================================
   */

  readonly quizService =
    inject(QuizService);

  readonly router =
    inject(Router);

  readonly audioService =
    inject(AudioService);

  /*
   * ========================================
   * QUIZ STATE
   * ========================================
   */

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

  /*
   * ========================================
   * CONFETTI
   * ========================================
   */

  readonly showConfetti =
    signal(false);

  readonly confettiPieces =
    Array.from(
      {
        length: 64,
      },
      (_, index) => index
    );

  private confettiTimer?:
    ReturnType<typeof setTimeout>;

  /*
   * ========================================
   * INIT
   * ========================================
   */

  ngOnInit(): void {

    if (this.isFinished()) {

      void this.router.navigate([
        '/resultado',
      ]);

      return;
    }

    this.quizService.startQuiz();
  }

  /*
   * ========================================
   * BUTTON HOVER SOUND
   * ========================================
   */

  playButtonHover(): void {

    if (
      this.isAnswered() ||
      this.isFinished()
    ) {
      return;
    }

    this.audioService.playSelect();
  }

  /*
   * ========================================
   * ANSWER
   * ========================================
   */

  answerQuestion(
    answerId: string
  ): void {

    if (
      this.isAnswered() ||
      this.isFinished()
    ) {
      return;
    }

    const optionExists =
      this.currentQuestion()
        .options
        .some(
          (option) =>
            option.id === answerId
        );

    if (!optionExists) {
      return;
    }

    /*
     * Sonido de selección.
     */

    this.audioService.playSelect();

    /*
     * Registrar respuesta.
     */

    this.quizService.answerQuestion(
      answerId
    );

    /*
     * Respuesta correcta.
     */

    if (
      this.isCorrectAnswer(answerId)
    ) {

      this.audioService.playCorrect();

      this.startConfetti();

    } else {

      /*
       * Respuesta incorrecta.
       */

      this.audioService.playIncorrect();

    }
  }

  /*
   * ========================================
   * NEXT QUESTION
   * ========================================
   */

  nextQuestion(): void {

    if (this.isFinished()) {

      void this.router.navigate([
        '/resultado',
      ]);

      return;
    }

    if (!this.isAnswered()) {
      return;
    }

    /*
     * Sonido del botón.
     */

    this.audioService.playNext();

    /*
     * Limpiar confeti.
     */

    this.clearConfettiTimer();

    this.showConfetti.set(false);

    /*
     * Avanzar en el servicio.
     */

    this.quizService.nextQuestion();

    /*
     * Última pregunta.
     */

    if (this.isFinished()) {

      void this.router.navigate([
        '/resultado',
      ]);

      return;
    }

    /*
     * Regresar al mapa.
     */

    void this.router.navigate([
      '/mapa',
    ]);
  }

  /*
   * ========================================
   * MAP
   * ========================================
   */

  goToMap(): void {

    this.clearConfettiTimer();

    this.showConfetti.set(false);

    void this.router.navigate([
      '/mapa',
    ]);
  }

  /*
   * ========================================
   * ANSWER VALIDATION
   * ========================================
   */

  isCorrectAnswer(
    answerId: string
  ): boolean {

    return this.quizService
      .isCorrectAnswer(
        answerId
      );
  }

  getAnswerClass(
    answerId: string
  ): string {

    if (!this.isAnswered()) {
      return '';
    }

    if (
      this.isCorrectAnswer(
        answerId
      )
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

  /*
   * ========================================
   * CHARACTER
   * ========================================
   */

  getCharacterImage(): string {

    if (!this.isAnswered()) {

      return (
        '/assets/characters/thinking.webp'
      );
    }

    const answer =
      this.selectedAnswer();

    if (
      answer !== null &&
      this.isCorrectAnswer(answer)
    ) {

      return (
        '/assets/characters/celebrating.webp'
      );
    }

    return (
      '/assets/characters/sad.webp'
    );
  }

  /*
   * ========================================
   * FEEDBACK TITLE
   * ========================================
   */

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

  /*
   * ========================================
   * FEEDBACK TEXT
   * ========================================
   */

  getFeedbackText(): string {

    const answer =
      this.selectedAnswer();

    if (answer === null) {
      return '';
    }

    if (
      this.isCorrectAnswer(answer)
    ) {

      return (
        '¡Respuesta correcta! ' +
        'Sigue explorando.'
      );
    }

    const question =
      this.currentQuestion();

    const correctOption =
      question.options.find(
        (option) =>
          option.id ===
          question.correctAnswer
      );

    return (
      `La respuesta correcta era: ${
        correctOption?.text ?? ''
      }`
    );
  }

  /*
   * ========================================
   * CONFETTI
   * ========================================
   */

  private startConfetti(): void {

    this.clearConfettiTimer();

    /*
     * Reiniciar la animación.
     */

    this.showConfetti.set(false);

    requestAnimationFrame(() => {

      if (
        this.isAnswered()
      ) {

        this.showConfetti.set(
          true
        );

      }

    });

    /*
     * Mantener el confeti visible
     * durante unos segundos.
     */

    this.confettiTimer =
      setTimeout(() => {

        this.showConfetti.set(
          false
        );

        this.confettiTimer =
          undefined;

      }, 4800);
  }

  /*
   * ========================================
   * CONFETTI POSITIONS
   * ========================================
   */

  getConfettiLeft(
    index: number
  ): number {

    const positions = [
      1,
      4,
      7,
      11,
      15,
      19,
      23,
      27,
      31,
      35,
      39,
      43,
      47,
      51,
      55,
      59,
      63,
      67,
      71,
      75,
      79,
      83,
      87,
      91,
      95,

      3,
      9,
      14,
      21,
      28,
      34,
      41,
      48,
      54,
      61,
      69,
      76,
      82,
      89,
      94,
      6,
      17,
      26,
      37,
      46,
      58,
      65,
      73,
      86,
      97,
      12,
      32,
      52,
      68,
      88,
      24,
      44,
      64,
      80,
      92,
      56,
      18,
      38,
      78,
      98,
    ];

    return (
      positions[index] ??
      50
    );
  }

  /*
   * ========================================
   * CONFETTI DELAY
   * ========================================
   */

  getConfettiDelay(
    index: number
  ): number {

    const delays = [
      0,
      120,
      240,
      360,
      80,
      190,
      310,
      430,
      150,
      270,
      390,
      510,
      60,
      220,
      340,
      470,
      130,
      290,
      410,
      540,
      30,
      170,
      300,
      450,
      100,
      250,
      370,
      490,
      140,
      330,
      460,
      580,
    ];

    return (
      delays[
        index %
        delays.length
      ] +
      Math.floor(index / 32) *
        80
    );
  }

  /*
   * ========================================
   * DESTROY
   * ========================================
   */

  ngOnDestroy(): void {

    this.clearConfettiTimer();

    this.showConfetti.set(
      false
    );
  }

  /*
   * ========================================
   * CLEAR CONFETTI TIMER
   * ========================================
   */

  private clearConfettiTimer(): void {

    if (
      this.confettiTimer !==
      undefined
    ) {

      clearTimeout(
        this.confettiTimer
      );

      this.confettiTimer =
        undefined;
    }
  }
}