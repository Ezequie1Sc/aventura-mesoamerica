import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './badges.html',
  styleUrl: './badges.scss',
})
export class Badges implements OnDestroy {
  private readonly quizService = inject(QuizService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  private readonly nameStorageKey = 'aventura-explorer-name';

  @ViewChild('nameDialog')
  private nameDialog!: ElementRef<HTMLDialogElement>;

  readonly isFinished = this.quizService.isFinished;
  readonly score = this.quizService.score;
  readonly totalQuestions = this.quizService.totalQuestions;

  readonly isDownloading = signal(false);
  readonly downloadCompleted = signal(false);
  readonly downloadError = signal('');

  readonly explorerName = signal(this.readSavedName());

  // Se limpia para validar y descargar, sin modificar
  // el texto del campo mientras el usuario está escribiendo.
  readonly cleanName = computed(() =>
    this.explorerName()
      .replace(/\s+/g, ' ')
      .trim()
  );

  readonly validName = computed(() => {
    const name = this.cleanName();

    return (
      name.length > 0 &&
      name.length <= 60 &&
      /\p{L}/u.test(name)
    );
  });

  private downloadResetTimer?: ReturnType<typeof setTimeout>;
  private destroyed = false;

  // ==========================================
  // NOMBRE GUARDADO
  // ==========================================

  private readSavedName(): string {
    try {
      if (typeof localStorage === 'undefined') {
        return '';
      }

      return localStorage.getItem(this.nameStorageKey) ?? '';
    } catch {
      return '';
    }
  }

  private saveName(name: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.nameStorageKey, name);
      }
    } catch {
      // La descarga funciona aunque el almacenamiento
      // del navegador no esté disponible.
    }
  }

  private removeSavedName(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.nameStorageKey);
      }
    } catch {
      // El estado del componente se reinicia igualmente.
    }
  }

  // ==========================================
  // RESULTADO
  // ==========================================

  getCurrentScore(): number {
    return this.isFinished()
      ? this.score()
      : this.storageService.getBestScore();
  }

  getBadge() {
    return this.quizService.getBadge(this.getCurrentScore());
  }

  getBadgeImage(): string {
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
      images[this.getBadge().id] ??
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

  // ==========================================
  // NUEVA AVENTURA
  // ==========================================

  restartQuiz(): void {
    if (this.isDownloading()) {
      return;
    }

    this.clearDownloadTimer();
    this.removeSavedName();

    this.explorerName.set('');
    this.downloadError.set('');
    this.downloadCompleted.set(false);

    this.quizService.restartQuiz();

    void this.router.navigate(['/map']);
  }

  goToHome(): void {
    void this.router.navigate(['/']);
  }

  // ==========================================
  // DIÁLOGO DEL NOMBRE
  // ==========================================

  openNameDialog(): void {
    if (this.isDownloading() || this.destroyed) {
      return;
    }

    this.downloadError.set('');
    this.downloadCompleted.set(false);
    this.clearDownloadTimer();

    const dialog = this.nameDialog.nativeElement;

    // Siempre permitir revisar el nombre antes de descargar.
    if (!dialog.open) {
      dialog.showModal();
    }

    dialog.querySelector<HTMLInputElement>('input')?.focus();
  }

  closeNameDialog(): void {
    if (this.isDownloading()) {
      return;
    }

    this.nameDialog.nativeElement.close();
  }

  onDialogCancel(event: Event): void {
    if (this.isDownloading()) {
      event.preventDefault();
    }
  }

  updateName(value: string): void {
    // No bloquear al escribir la primera letra.
    // Solo bloquear durante la generación de la imagen.
    if (this.isDownloading()) {
      return;
    }

    this.explorerName.set(value);
    this.downloadError.set('');
  }

  confirmDownload(event: Event): void {
    event.preventDefault();

    if (this.isDownloading()) {
      return;
    }

    if (!this.validName()) {
      this.downloadError.set(
        'Escribe tu nombre, con un máximo de 60 caracteres.'
      );
      return;
    }

    void this.downloadCard();
  }

  // ==========================================
  // GENERAR Y DESCARGAR TARJETA
  // ==========================================

  async downloadCard(): Promise<void> {
    if (this.isDownloading() || this.destroyed) {
      return;
    }

    // Protección adicional, aunque se llame al método
    // directamente.
    if (!this.validName()) {
      this.openNameDialog();

      this.downloadError.set(
        'Escribe tu nombre para descargar la insignia.'
      );

      return;
    }

    // Capturar el nombre completo confirmado.
    const name = this.cleanName();
    const badge = this.getBadge();
    const score = this.getCurrentScore();
    const total = this.totalQuestions();
    const imageUrl = this.getBadgeImage();

    this.isDownloading.set(true);
    this.downloadCompleted.set(false);
    this.downloadError.set('');

    this.clearDownloadTimer();

    try {
      const badgeImage = await this.loadImage(imageUrl);

      if (this.destroyed) {
        return;
      }

      const canvas = document.createElement('canvas');

      canvas.width = 1080;
      canvas.height = 1350;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('No se pudo crear la imagen.');
      }

      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Fondo.
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

      // Resplandor.
      context.fillStyle = 'rgba(244, 198, 72, 0.12)';

      context.beginPath();
      context.arc(540, 430, 390, 0, Math.PI * 2);
      context.fill();

      // Marco.
      context.strokeStyle = '#e6b84b';
      context.lineWidth = 8;
      context.strokeRect(42, 42, 996, 1266);

      // Encabezado.
      this.drawFittedText(
        context,
        'AVENTURA',
        115,
        62,
        '#f8d875'
      );

      this.drawFittedText(
        context,
        'MESOAMÉRICA',
        190,
        72,
        '#fff4ce'
      );

      // Insignia, conservando sus proporciones.
      const maxWidth = 580;
      const maxHeight = 500;

      const ratio = Math.min(
        maxWidth / badgeImage.naturalWidth,
        maxHeight / badgeImage.naturalHeight
      );

      const width = badgeImage.naturalWidth * ratio;
      const height = badgeImage.naturalHeight * ratio;

      context.drawImage(
        badgeImage,
        (canvas.width - width) / 2,
        245 + (maxHeight - height) / 2,
        width,
        height
      );

      this.drawFittedText(
        context,
        'INSIGNIA OBTENIDA',
        790,
        30,
        '#f8d875'
      );

      this.drawFittedText(
        context,
        badge.name,
        850,
        48,
        '#ffffff'
      );

      // Recuadro del nombre.
      context.fillStyle = '#fff4d8';
      context.fillRect(100, 905, 880, 150);

      this.drawFittedText(
        context,
        'OTORGADA A',
        942,
        25,
        '#426044'
      );

      // Dibujar el nombre completo en la imagen.
      this.drawFittedText(
        context,
        name,
        1000,
        54,
        '#173f2d',
        800
      );

      // Puntuación.
      this.drawFittedText(
        context,
        `${score} / ${total}`,
        1120,
        62,
        '#f8d875'
      );

      this.drawFittedText(
        context,
        '¡Tu aventura continúa!',
        1200,
        30,
        '#fff4ce'
      );

      this.drawFittedText(
        context,
        'Aventura Mesoamérica',
        1250,
        24,
        '#c9e2d0'
      );

      // Preparar descarga.
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      link.download =
        `${badge.id}-aventura-mesoamerica.png`;

      link.href = imageData;

      document.body.appendChild(link);

      try {
        link.click();
      } finally {
        link.remove();
      }

      // Guardar únicamente después de generar la tarjeta.
      this.saveName(name);
      this.explorerName.set(name);

      this.nameDialog.nativeElement.close();
      this.downloadCompleted.set(true);

      this.downloadResetTimer = setTimeout(() => {
        this.downloadCompleted.set(false);
        this.downloadResetTimer = undefined;
      }, 3500);
    } catch {
      if (!this.destroyed) {
        // Mantener visible el formulario y su error.
        const dialog = this.nameDialog.nativeElement;

        if (!dialog.open) {
          dialog.showModal();
        }

        this.downloadError.set(
          'No pudimos preparar tu insignia. Inténtalo de nuevo.'
        );
      }
    } finally {
      this.isDownloading.set(false);
    }
  }

  // ==========================================
  // CARGAR IMAGEN
  // ==========================================

  private loadImage(
    src: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      const timeout = setTimeout(() => {
        image.onload = null;
        image.onerror = null;

        reject(
          new Error('La imagen tardó demasiado en cargar.')
        );
      }, 15000);

      image.onload = () => {
        clearTimeout(timeout);

        image.onload = null;
        image.onerror = null;

        if (
          image.naturalWidth === 0 ||
          image.naturalHeight === 0
        ) {
          reject(new Error('La imagen no tiene un tamaño válido.'));
          return;
        }

        resolve(image);
      };

      image.onerror = () => {
        clearTimeout(timeout);

        image.onload = null;
        image.onerror = null;

        reject(
          new Error('No se pudo cargar la insignia.')
        );
      };

      image.src = src;
    });
  }

  // ==========================================
  // AJUSTAR TEXTO AL ANCHO DISPONIBLE
  // ==========================================

  private drawFittedText(
    context: CanvasRenderingContext2D,
    text: string,
    y: number,
    initialSize: number,
    color: string,
    maxWidth = 880
  ): void {
    let size = initialSize;

    const setFont = (): void => {
      context.font =
        `bold ${size}px "Trebuchet MS", Arial, sans-serif`;
    };

    setFont();

    // Reducir el tamaño si el nombre es largo.
    while (
      context.measureText(text).width > maxWidth &&
      size > 20
    ) {
      size -= 1;
      setFont();
    }

    context.fillStyle = color;
    context.fillText(text, 540, y, maxWidth);
  }

  // ==========================================
  // LIMPIEZA
  // ==========================================

  private clearDownloadTimer(): void {
    if (this.downloadResetTimer !== undefined) {
      clearTimeout(this.downloadResetTimer);
      this.downloadResetTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearDownloadTimer();
  }
}