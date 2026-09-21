import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';

interface MapStation {
  id: number;
  title: string;
  top: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private readonly quizService = inject(QuizService);

  readonly currentQuestionIndex =
    this.quizService.currentQuestionIndex;

  readonly totalQuestions =
    this.quizService.totalQuestions;

  readonly isFinished =
    this.quizService.isFinished;

  // Al terminar, todas las estaciones quedan completadas.
  // Durante el juego, las anteriores al índice actual.
  readonly completedCount = computed(() => {
    const total = this.totalQuestions();

    if (this.isFinished()) {
      return total;
    }

    return Math.min(
      Math.max(this.currentQuestionIndex(), 0),
      total
    );
  });

  readonly adventureCompleted = computed(
    () => this.totalQuestions() > 0 && this.isFinished()
  );

  readonly stations: readonly MapStation[] = [
    {
      id: 1,
      title: 'El comienzo',
      top: (70 / 840) * 100,
    },
    {
      id: 2,
      title: 'Las culturas',
      top: (200 / 840) * 100,
    },
    {
      id: 3,
      title: 'El maíz',
      top: (330 / 840) * 100,
    },
    {
      id: 4,
      title: 'Los pueblos',
      top: (460 / 840) * 100,
    },
    {
      id: 5,
      title: 'El cacao',
      top: (590 / 840) * 100,
    },
    {
      id: 6,
      title: 'Los templos',
      top: (720 / 840) * 100,
    },
  ];

  isUnlocked(index: number): boolean {
    if (index < 0 || index >= this.totalQuestions()) {
      return false;
    }

    return (
      this.adventureCompleted() ||
      index <= this.currentQuestionIndex()
    );
  }

  isCurrent(index: number): boolean {
    return (
      !this.adventureCompleted() &&
      index >= 0 &&
      index < this.totalQuestions() &&
      index === this.currentQuestionIndex()
    );
  }

  isCompleted(index: number): boolean {
    return (
      index >= 0 &&
      index < this.completedCount()
    );
  }
}