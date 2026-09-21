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
  // =========================================================
  // DEPENDENCIAS
  // =========================================================

  private readonly quizService =
    inject(QuizService);

  private readonly router =
    inject(Router);

  // =========================================================
  // ESTADO DEL QUIZ
  // =========================================================

  readonly score =
    this.quizService.score;

  readonly totalQuestions =
    this.quizService.totalQuestions;

  readonly result =
    this.quizService.result;

  // =========================================================
  // INSIGNIA
  // =========================================================

  getBadge() {
    return this.quizService.getBadge(
      this.score()
    );
  }

  getBadgeImage(): string {
    const badgeId =
      this.getBadge().id;

    const images: Record<
      string,
      string
    > = {
      semilla:
        '/assets/badges/semilla-conocimiento.webp',

      aprendiz:
        '/assets/badges/aprendiz-mesoamerica.webp',

      explorador:
        '/assets/badges/explorador-conocimiento.webp',

      'pase-aventura':
        '/assets/badges/pase-aventura-mesoamerica.webp',
    };

    return (
      images[badgeId] ??
      '/assets/badges/semilla-conocimiento.webp'
    );
  }

  // =========================================================
  // PERSONAJE
  // =========================================================

  getCharacterImage(): string {
    const score =
      this.score();

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

  // =========================================================
  // TÍTULO DEL RESULTADO
  // =========================================================

  getResultTitle(): string {
    const score =
      this.score();

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

  // =========================================================
  // MENSAJE DEL RESULTADO
  // =========================================================

  getResultMessage(): string {
    const score =
      this.score();

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

  // =========================================================
  // NUEVA AVENTURA
  // =========================================================

  restartQuiz(): void {
    /*
     * Limpia completamente el progreso de
     * Aventura Mesoamérica y reinicia el estado
     * del quiz.
     */

    this.quizService.restartQuiz();

    /*
     * Regresamos al inicio para que el usuario
     * vuelva a recorrer:
     *
     * Inicio
     *   ↓
     * Instrucciones
     *   ↓
     * Mapa
     *   ↓
     * Preguntas
     */

    this.router.navigate(['/']);
  }
}