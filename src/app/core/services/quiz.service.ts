import { Injectable, computed, signal } from '@angular/core';

import { QUESTIONS } from '../../data/questions';
import { BADGES } from '../../data/badges';
import { Badge } from '../models/badge.model';
import { Question } from '../models/question.model';
import { QuizResult } from '../models/quiz-result.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly questions = QUESTIONS;
  private readonly badges = BADGES;

  // =========================================================
  // ESTADO DEL QUIZ
  // =========================================================

  readonly currentQuestionIndex = signal(0);
  readonly score = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly isAnswered = signal(false);
  readonly isFinished = signal(false);

  /**
   * Indica si el usuario ya inició una aventura.
   *
   * Esto evita que un componente vuelva a ejecutar
   * startQuiz() accidentalmente y mande al usuario
   * nuevamente a la pregunta 1.
   */
  private readonly hasStarted = signal(false);

  // =========================================================
  // PREGUNTA ACTUAL
  // =========================================================

  readonly currentQuestion = computed<Question>(
    () => this.questions[this.currentQuestionIndex()]
  );

  readonly totalQuestions = computed(
    () => this.questions.length
  );

  readonly progress = computed(
    () =>
      ((this.currentQuestionIndex() + 1) /
        this.totalQuestions()) *
      100
  );

  // =========================================================
  // RESULTADO
  // =========================================================

  readonly result = computed<QuizResult | null>(() => {
    if (!this.isFinished()) {
      return null;
    }

    const finalScore = this.score();
    const total = this.totalQuestions();

    return {
      score: finalScore,
      totalQuestions: total,
      percentage: (finalScore / total) * 100,
      badgeId: this.getBadge(finalScore).id,
    };
  });

  constructor(
    private readonly storageService: StorageService
  ) {}

  // =========================================================
  // INICIAR QUIZ
  // =========================================================

  startQuiz(): void {
    /**
     * IMPORTANTE:
     *
     * Si el quiz ya comenzó, NO lo reiniciamos.
     *
     * Esto evita que un cambio de ruta, componente o
     * navegación vuelva accidentalmente a la pregunta 1.
     */
    if (this.hasStarted() && !this.isFinished()) {
      return;
    }

    this.resetQuizState();

    this.hasStarted.set(true);

    // Permitir capturar un nuevo nombre para la insignia
    localStorage.removeItem('aventura-explorer-name');
  }

  // =========================================================
  // RESPONDER PREGUNTA
  // =========================================================

  answerQuestion(answerId: string): void {
    // No permitir responder dos veces
    if (this.isAnswered() || this.isFinished()) {
      return;
    }

    this.selectedAnswer.set(answerId);
    this.isAnswered.set(true);

    // Verificar respuesta
    if (
      answerId ===
      this.currentQuestion().correctAnswer
    ) {
      this.score.update(
        (currentScore) => currentScore + 1
      );
    }
  }

  // =========================================================
  // SIGUIENTE PREGUNTA
  // =========================================================

  nextQuestion(): void {
    // No avanzar si todavía no respondió
    if (!this.isAnswered()) {
      return;
    }

    // Si el quiz ya terminó, no hacer nada
    if (this.isFinished()) {
      return;
    }

    const nextIndex =
      this.currentQuestionIndex() + 1;

    // =====================================================
    // ÚLTIMA PREGUNTA
    // =====================================================

    if (
      nextIndex >=
      this.totalQuestions()
    ) {
      this.finishQuiz();
      return;
    }

    // =====================================================
    // SIGUIENTE PREGUNTA
    // =====================================================

    this.currentQuestionIndex.set(nextIndex);

    // Limpiar respuesta anterior
    this.selectedAnswer.set(null);

    // Permitir responder la nueva pregunta
    this.isAnswered.set(false);
  }

  // =========================================================
  // FINALIZAR QUIZ
  // =========================================================

  finishQuiz(): void {
    // Evitar finalizar dos veces
    if (this.isFinished()) {
      return;
    }

    this.isFinished.set(true);

    const finalScore = this.score();

    const badge = this.getBadge(finalScore);

    // Guardar resultado
    this.storageService.saveResult(
      finalScore,
      badge.id
    );
  }

  // =========================================================
  // REINICIAR QUIZ
  // =========================================================

  restartQuiz(): void {
    this.resetQuizState();

    this.hasStarted.set(true);

    localStorage.removeItem(
      'aventura-explorer-name'
    );
  }

  // =========================================================
  // RESET INTERNO
  // =========================================================

  private resetQuizState(): void {
    this.currentQuestionIndex.set(0);

    this.score.set(0);

    this.selectedAnswer.set(null);

    this.isAnswered.set(false);

    this.isFinished.set(false);
  }

  // =========================================================
  // RESPUESTA CORRECTA
  // =========================================================

  isCorrectAnswer(answerId: string): boolean {
    return (
      answerId ===
      this.currentQuestion().correctAnswer
    );
  }

  // =========================================================
  // INSIGNIA
  // =========================================================

  getBadge(score: number): Badge {
    return (
      this.badges.find(
        (badge) =>
          score >= badge.minScore &&
          score <= badge.maxScore
      ) ??
      this.badges[this.badges.length - 1]
    );
  }
}