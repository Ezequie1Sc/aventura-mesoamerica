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

  readonly currentQuestionIndex = signal(0);
  readonly score = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly isAnswered = signal(false);
  readonly isFinished = signal(false);

  readonly currentQuestion = computed<Question>(
    () => this.questions[this.currentQuestionIndex()]
  );

  readonly totalQuestions = computed(() => this.questions.length);

  readonly progress = computed(
    () => ((this.currentQuestionIndex() + 1) / this.totalQuestions()) * 100
  );

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

  constructor(private readonly storageService: StorageService) {}

  startQuiz(): void {
    this.currentQuestionIndex.set(0);
    this.score.set(0);
    this.selectedAnswer.set(null);
    this.isAnswered.set(false);
    this.isFinished.set(false);
  }

  answerQuestion(answerId: string): void {
    if (this.isAnswered() || this.isFinished()) {
      return;
    }

    this.selectedAnswer.set(answerId);
    this.isAnswered.set(true);

    if (answerId === this.currentQuestion().correctAnswer) {
      this.score.update((score) => score + 1);
    }
  }

  nextQuestion(): void {
    if (!this.isAnswered()) {
      return;
    }

    const nextIndex = this.currentQuestionIndex() + 1;

    if (nextIndex >= this.totalQuestions()) {
      this.finishQuiz();
      return;
    }

    this.currentQuestionIndex.set(nextIndex);
    this.selectedAnswer.set(null);
    this.isAnswered.set(false);
  }

  finishQuiz(): void {
    if (this.isFinished()) {
      return;
    }

    this.isFinished.set(true);

    const finalScore = this.score();
    const badge = this.getBadge(finalScore);

    this.storageService.saveResult(finalScore, badge.id);
  }

  restartQuiz(): void {
    this.startQuiz();
  }

  isCorrectAnswer(answerId: string): boolean {
    return answerId === this.currentQuestion().correctAnswer;
  }

  getBadge(score: number): Badge {
    return (
      this.badges.find(
        (badge) => score >= badge.minScore && score <= badge.maxScore
      ) ?? this.badges[this.badges.length - 1]
    );
  }
}