import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-result',
  imports: [RouterLink],
  templateUrl: './result.html',
  styleUrl: './result.scss',
})
export class Result {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly score = this.quizService.score;
  readonly totalQuestions = this.quizService.totalQuestions;
  readonly result = this.quizService.result;

  getBadge() {
    return this.quizService.getBadge(this.score());
  }

  getCharacterImage(): string {
    const score = this.score();

    if (score === 6) {
      return '/assets/characters/victory.webp';
    }

    if (score >= 4) {
      return '/assets/characters/celebrating.webp';
    }

    if (score >= 2) {
      return '/assets/characters/happy.webp';
    }

    return '/assets/characters/welcome.webp';
  }

  getResultTitle(): string {
    const score = this.score();

    if (score === 6) {
      return '¡Aventura completada!';
    }

    if (score >= 4) {
      return '¡Gran explorador!';
    }

    if (score >= 2) {
      return '¡Buen comienzo!';
    }

    return '¡Sigue explorando!';
  }

  getResultMessage(): string {
    const score = this.score();

    if (score === 6) {
      return '¡Demostraste que eres un gran conocedor de Mesoamérica!';
    }

    if (score >= 4) {
      return '¡Descubriste muchos secretos de las culturas mesoamericanas!';
    }

    if (score >= 2) {
      return '¡Ya conoces algunos secretos de Mesoamérica! Sigue aprendiendo.';
    }

    return 'Toda gran aventura comienza con un primer paso. ¡Sigue aprendiendo!';
  }

  restartQuiz(): void {
    this.quizService.restartQuiz();
    this.router.navigate(['/quiz']);
  }
}