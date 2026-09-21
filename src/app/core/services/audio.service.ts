import { Injectable } from '@angular/core';

type BackgroundMusic =
  | 'home'
  | 'map'
  | 'quiz';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly basePath = '/assets/audio';

  /*
   * ========================================
   * SOUND EFFECTS
   * ========================================
   */

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

  /*
   * ========================================
   * BACKGROUND MUSIC
   * ========================================
   */

  private readonly music = {
    home: `${this.basePath}/music/home.mp3`,
    map: `${this.basePath}/music/map.mp3`,
    quiz: `${this.basePath}/music/quiz.mp3`,
  } as const;

  /*
   * ========================================
   * AUDIO INSTANCES
   * ========================================
   */

  private currentAudio?: HTMLAudioElement;

  private backgroundAudio?: HTMLAudioElement;

  private currentBackgroundMusic?: BackgroundMusic;

  /*
   * ========================================
   * SOUND EFFECTS
   * ========================================
   */

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

  /*
   * ========================================
   * BACKGROUND MUSIC
   * ========================================
   */

  playBackground(
    music: BackgroundMusic,
    volume = 0.25
  ): void {
    /*
     * Si ya está reproduciéndose la misma música,
     * no hacemos nada.
     */
    if (
      this.currentBackgroundMusic === music &&
      this.backgroundAudio &&
      !this.backgroundAudio.paused
    ) {
      return;
    }

    /*
     * Detener la música anterior.
     */
    this.stopBackground();

    const audio = new Audio(
      this.music[music]
    );

    audio.loop = true;

    audio.volume = Math.min(
      Math.max(volume, 0),
      1
    );

    this.backgroundAudio = audio;
    this.currentBackgroundMusic = music;

    void audio.play().catch(() => {
      /*
       * El navegador puede bloquear el autoplay
       * hasta que exista una interacción del usuario.
       *
       * La música podrá iniciarse posteriormente
       * desde una acción del usuario.
       */
    });
  }

  playHomeMusic(): void {
    this.playBackground('home', 0.25);
  }

  playMapMusic(): void {
    this.playBackground('map', 0.25);
  }

  playQuizMusic(): void {
    this.playBackground('quiz', 0.22);
  }

  stopBackground(): void {
    if (!this.backgroundAudio) {
      this.currentBackgroundMusic = undefined;
      return;
    }

    this.backgroundAudio.pause();
    this.backgroundAudio.currentTime = 0;

    this.backgroundAudio = undefined;
    this.currentBackgroundMusic = undefined;
  }

  /*
   * ========================================
   * STOP SOUND EFFECT
   * ========================================
   */

  stop(): void {
    if (!this.currentAudio) {
      return;
    }

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = undefined;
  }
}