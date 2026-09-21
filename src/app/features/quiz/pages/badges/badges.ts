import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-badges',
  imports: [RouterLink],
  templateUrl: './badges.html',
  styleUrl: './badges.scss',
})
export class Badges {
  private readonly quizService = inject(QuizService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  readonly isFinished = this.quizService.isFinished;
  readonly score = this.quizService.score;
  readonly totalQuestions = this.quizService.totalQuestions;

  readonly isDownloading = signal(false);
  readonly downloadCompleted = signal(false);

  private downloadResetTimer?: ReturnType<typeof setTimeout>;

  getCurrentScore(): number {
    if (this.isFinished()) {
      return this.score();
    }

    return this.storageService.getBestScore();
  }

  getBadge() {
    return this.quizService.getBadge(this.getCurrentScore());
  }

  getBadgeImage(): string {
    const badgeId = this.getBadge().id;

    const images: Record<string, string> = {
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

  getCharacterImage(): string {
    const score = this.getCurrentScore();

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

  getScoreMessage(): string {
    const score = this.getCurrentScore();

    if (score === 6) {
      return '¡Demostraste que eres un gran conocedor de Mesoamérica!';
    }

    if (score >= 4) {
      return '¡Descubriste muchos secretos de las culturas mesoamericanas!';
    }

    if (score >= 2) {
      return '¡Ya conoces muchos secretos de Mesoamérica!';
    }

    return 'Toda gran aventura comienza con un primer paso.';
  }

  async downloadCard(): Promise<void> {
    if (this.isDownloading()) {
      return;
    }

    this.isDownloading.set(true);
    this.downloadCompleted.set(false);

    if (this.downloadResetTimer) {
      clearTimeout(this.downloadResetTimer);
    }

    const badge = this.getBadge();
    const score = this.getCurrentScore();
    const imageUrl = this.getBadgeImage();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      this.isDownloading.set(false);
      return;
    }

    canvas.width = 1080;
    canvas.height = 1350;

    const gradient = context.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

    gradient.addColorStop(0, '#173f2d');
    gradient.addColorStop(0.55, '#276047');
    gradient.addColorStop(1, '#10291f');

    context.fillStyle = gradient;

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      'rgba(244, 198, 72, 0.12)';

    context.beginPath();

    context.arc(
      540,
      420,
      430,
      0,
      Math.PI * 2
    );

    context.fill();

    context.strokeStyle = '#e6b84b';
    context.lineWidth = 8;

    context.strokeRect(
      42,
      42,
      996,
      1266
    );

    context.textAlign = 'center';

    context.fillStyle = '#f8d875';
    context.font = 'bold 64px Arial';

    context.fillText(
      'AVENTURA',
      540,
      125
    );

    context.fillStyle = '#fff4ce';
    context.font = 'bold 72px Arial';

    context.fillText(
      'MESOAMÉRICA',
      540,
      205
    );

    const badgeImage = new Image();

    badgeImage.onload = () => {
      const maxSize = 580;

      const ratio = Math.min(
        maxSize / badgeImage.width,
        maxSize / badgeImage.height
      );

      const width =
        badgeImage.width * ratio;

      const height =
        badgeImage.height * ratio;

      context.drawImage(
        badgeImage,
        (canvas.width - width) / 2,
        250,
        width,
        height
      );

      context.fillStyle = '#f8d875';
      context.font = 'bold 34px Arial';

      context.fillText(
        'INSIGNIA OBTENIDA',
        540,
        890
      );

      context.fillStyle = '#ffffff';
      context.font = 'bold 48px Arial';

      context.fillText(
        badge.name,
        540,
        960
      );

      context.fillStyle = '#f8d875';
      context.font = 'bold 62px Arial';

      context.fillText(
        `${score} / 6`,
        540,
        1060
      );

      context.fillStyle = '#fff4ce';
      context.font = '28px Arial';

      context.fillText(
        '¡Tu aventura continúa!',
        540,
        1160
      );

      context.fillStyle = '#c9e2d0';
      context.font = '24px Arial';

      context.fillText(
        'Aventura Mesoamérica',
        540,
        1220
      );

      const link =
        document.createElement('a');

      link.download =
        `${badge.id}-aventura-mesoamerica.png`;

      link.href =
        canvas.toDataURL('image/png');

      document.body.appendChild(link);

      link.click();

      link.remove();

      this.isDownloading.set(false);
      this.downloadCompleted.set(true);

      this.downloadResetTimer =
        setTimeout(() => {
          this.downloadCompleted.set(false);
        }, 3500);
    };

    badgeImage.onerror = () => {
      this.isDownloading.set(false);
      this.downloadCompleted.set(false);
    };

    badgeImage.src = imageUrl;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}