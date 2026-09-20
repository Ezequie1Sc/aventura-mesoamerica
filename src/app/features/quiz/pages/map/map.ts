import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-map',
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

  isUnlocked(index: number): boolean {
    return index <= this.currentQuestionIndex();
  }

  isCurrent(index: number): boolean {
    return index === this.currentQuestionIndex();
  }

  getStationClass(index: number): string {
    if (this.isCurrent(index)) {
      return 'map-station--current';
    }

    if (this.isUnlocked(index)) {
      return 'map-station--completed';
    }

    return 'map-station--locked';
  }
}