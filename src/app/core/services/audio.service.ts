import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly basePath = '/assets/audio';

  private readonly sounds = {
    select: `${this.basePath}/ui/select.wav`,
    selectAlternative: `${this.basePath}/ui/select1.wav`,
    next: `${this.basePath}/ui/next.wav`,
    correct: `${this.basePath}/quiz/correct.wav`,
    incorrect: `${this.basePath}/quiz/incorrect.wav`,
    achievement: `${this.basePath}/rewards/achievement.wav`,
    victory: `${this.basePath}/rewards/victory.wav`,
    win: `${this.basePath}/ui/win.wav`,
  } as const;

  private currentAudio?: HTMLAudioElement;

  play(
    sound: keyof typeof this.sounds,
    volume = 1
  ): void {
    this.stop();

    const audio = new Audio(
      this.sounds[sound]
    );

    audio.volume = Math.min(
      Math.max(volume, 0),
      1
    );

    this.currentAudio = audio;

    void audio.play().catch(() => {
      /*
       * El navegador puede bloquear la reproducción
       * si no existe una interacción del usuario.
       *
       * No hacemos nada en ese caso para evitar
       * errores en consola que interrumpan el quiz.
       */
    });

    audio.addEventListener(
      'ended',
      () => {
        if (this.currentAudio === audio) {
          this.currentAudio = undefined;
        }
      },
      { once: true }
    );
  }

  playSelect(): void {
    this.play('select', 0.7);
  }

  playSelectAlternative(): void {
    this.play(
      'selectAlternative',
      0.7
    );
  }

  playNext(): void {
    this.play('next', 0.8);
  }

  playCorrect(): void {
    this.play('correct', 0.8);
  }

  playIncorrect(): void {
    this.play('incorrect', 0.65);
  }

  playAchievement(): void {
    this.play('achievement', 0.9);
  }

  playVictory(): void {
    this.play('victory', 0.9);
  }

  playWin(): void {
    this.play('win', 0.85);
  }

  stop(): void {
    if (!this.currentAudio) {
      return;
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = undefined;
  }
}