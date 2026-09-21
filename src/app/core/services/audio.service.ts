import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

type BackgroundMusic =
  | 'home'
  | 'map'
  | 'quiz';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly basePath =
    '/assets/audio';

  /*
   * ========================================
   * SOUND EFFECTS
   * ========================================
   */

  private readonly sounds = {
    select:
      `${this.basePath}/ui/select.wav`,

    selectAlternative:
      `${this.basePath}/ui/select1.wav`,

    next:
      `${this.basePath}/ui/next.wav`,

    correct:
      `${this.basePath}/quiz/correct.wav`,

    incorrect:
      `${this.basePath}/quiz/incorrect.wav`,

    achievement:
      `${this.basePath}/rewards/achievement.wav`,

    victory:
      `${this.basePath}/rewards/victory.wav`,

    win:
      `${this.basePath}/ui/win.wav`,

    piplup:
      `${this.basePath}/music/piplup.mp3`,
  } as const;

  /*
   * ========================================
   * BACKGROUND MUSIC
   * ========================================
   */

  private readonly music = {
    home:
      `${this.basePath}/music/home.mp3`,

    map:
      `${this.basePath}/music/map.mp3`,

    quiz:
      `${this.basePath}/music/quiz.mp3`,
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
   * PIPLUP TIMER
   * ========================================
   */

  private piplupTimer?: ReturnType<typeof setTimeout>;

  /*
   * ========================================
   * CONSTRUCTOR
   * ========================================
   */

  constructor(
    private readonly router: Router
  ) {
    this.listenToNavigation();
  }

  /*
   * ========================================
   * ROUTE MUSIC
   * ========================================
   */

  private listenToNavigation(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.handleRouteMusic(
          event.urlAfterRedirects
        );
      });
  }

  private handleRouteMusic(
    url: string
  ): void {

    /*
     * ======================================
     * HOME + INSTRUCTIONS + BADGES
     * ======================================
     */

    if (
      url === '/' ||
      url.startsWith('/instrucciones') ||
      url.startsWith('/insignias')
    ) {
      this.playHomeMusic();
      return;
    }

    /*
     * ======================================
     * MAP
     * ======================================
     */

    if (url.startsWith('/mapa')) {
      this.playMapMusic();
      return;
    }

    /*
     * ======================================
     * QUIZ
     * ======================================
     */

    if (url.startsWith('/quiz')) {
      this.playQuizMusic();
      return;
    }

    /*
     * ======================================
     * RESULT
     * ======================================
     *
     * Resultado utiliza home.mp3.
     *
     * Piplup NO se reproduce automáticamente.
     */

    if (url.startsWith('/resultado')) {
      this.playHomeMusic();
    }
  }

  /*
   * ========================================
   * GENERIC SOUND
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
       * El navegador puede bloquear
       * la reproducción automática.
       */
    });

    audio.addEventListener(
      'ended',
      () => {

        if (
          this.currentAudio === audio
        ) {
          this.currentAudio =
            undefined;
        }

      },
      {
        once: true,
      }
    );
  }

  /*
   * ========================================
   * UI SOUNDS
   * ========================================
   */

  playSelect(): void {
    this.play(
      'select',
      0.7
    );
  }

  playSelectAlternative(): void {
    this.play(
      'selectAlternative',
      0.7
    );
  }

  playNext(): void {
    this.play(
      'next',
      0.8
    );
  }

  /*
   * ========================================
   * QUIZ SOUNDS
   * ========================================
   */

  playCorrect(): void {
    this.play(
      'correct',
      0.8
    );
  }

  playIncorrect(): void {
    this.play(
      'incorrect',
      0.65
    );
  }

  /*
   * ========================================
   * REWARD SOUNDS
   * ========================================
   */

  playAchievement(): void {
    this.play(
      'achievement',
      0.9
    );
  }

  playVictory(): void {
    this.play(
      'victory',
      0.9
    );
  }

  playWin(): void {
    this.play(
      'win',
      0.85
    );
  }

  /*
   * ========================================
   * PIPLUP
   * ========================================
   *
   * Piplup se reproduce únicamente cuando
   * el usuario presiona la insignia.
   *
   * SOLO se reproducen los primeros 3 segundos.
   */

  playPiplup(): void {

    /*
     * Cancelamos cualquier temporizador
     * anterior de Piplup.
     */

    this.clearPiplupTimer();

    /*
     * play() detiene el efecto actual.
     */

    this.play(
      'piplup',
      0.75
    );

    /*
     * Guardamos una referencia al audio actual.
     */

    const audio =
      this.currentAudio;

    if (!audio) {
      return;
    }

    /*
     * Detener Piplup exactamente después
     * de 3 segundos.
     */

    this.piplupTimer =
      setTimeout(() => {

        /*
         * Solo detenemos el audio si
         * sigue siendo el mismo Piplup
         * que iniciamos.
         */

        if (
          this.currentAudio === audio
        ) {
          audio.pause();

          audio.currentTime = 0;

          this.currentAudio =
            undefined;
        }

        this.piplupTimer =
          undefined;

      }, 3000);
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
     * Si ya está reproduciéndose la misma
     * música, no la reiniciamos.
     */

    if (
      this.currentBackgroundMusic === music &&
      this.backgroundAudio &&
      !this.backgroundAudio.paused
    ) {
      return;
    }

    /*
     * Detener música anterior.
     */

    this.stopBackground();

    const audio = new Audio(
      this.music[music]
    );

    /*
     * Música de fondo en loop.
     */

    audio.loop = true;

    audio.volume = Math.min(
      Math.max(volume, 0),
      1
    );

    this.backgroundAudio =
      audio;

    this.currentBackgroundMusic =
      music;

    void audio.play().catch(() => {
      /*
       * El navegador puede bloquear
       * autoplay hasta que exista
       * interacción del usuario.
       */
    });
  }

  /*
   * ========================================
   * INDIVIDUAL BACKGROUND MUSIC
   * ========================================
   */

  playHomeMusic(): void {
    this.playBackground(
      'home',
      0.25
    );
  }

  playMapMusic(): void {
    this.playBackground(
      'map',
      0.25
    );
  }

  playQuizMusic(): void {
    this.playBackground(
      'quiz',
      0.22
    );
  }

  /*
   * ========================================
   * STOP BACKGROUND MUSIC
   * ========================================
   */

  stopBackground(): void {

    if (!this.backgroundAudio) {

      this.currentBackgroundMusic =
        undefined;

      return;
    }

    this.backgroundAudio.pause();

    this.backgroundAudio.currentTime =
      0;

    this.backgroundAudio =
      undefined;

    this.currentBackgroundMusic =
      undefined;
  }

  /*
   * ========================================
   * STOP PIPLUP TIMER
   * ========================================
   */

  private clearPiplupTimer(): void {

    if (
      this.piplupTimer !== undefined
    ) {
      clearTimeout(
        this.piplupTimer
      );

      this.piplupTimer =
        undefined;
    }
  }

  /*
   * ========================================
   * STOP SOUND EFFECT
   * ========================================
   */

  stop(): void {

    /*
     * Si estamos deteniendo el efecto
     * actual, también cancelamos el
     * temporizador de Piplup.
     */

    this.clearPiplupTimer();

    if (!this.currentAudio) {
      return;
    }

    this.currentAudio.pause();

    this.currentAudio.currentTime =
      0;

    this.currentAudio =
      undefined;
  }
}