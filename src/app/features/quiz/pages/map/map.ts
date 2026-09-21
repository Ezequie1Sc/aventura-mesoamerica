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

  /*
   * Mantiene la lógica de tu componente:
   * los índices anteriores al actual están completados.
   */
  readonly completedCount = computed(() =>
    Math.min(
      Math.max(this.currentQuestionIndex(), 0),
      this.totalQuestions(),
    ),
  );

  readonly adventureCompleted = computed(() =>
    this.totalQuestions() > 0 &&
    this.completedCount() >= this.totalQuestions(),
  );

  /*
   * Las posiciones coinciden con el camino SVG:
   * y = 70, 200, 330, 460, 590 y 720
   * dentro de una altura de 840 unidades.
   */
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
    return index <= this.completedCount();
  }

  isCurrent(index: number): boolean {
    return (
      !this.adventureCompleted() &&
      index === this.completedCount()
    );
  }

  isCompleted(index: number): boolean {
    return index < this.completedCount();
  }
}