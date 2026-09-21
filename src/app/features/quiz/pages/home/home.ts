import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { AudioService } from '../../../../core/services/audio.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  @ViewChild('helpDialog')
  private helpDialog!: ElementRef<HTMLDialogElement>;

  readonly audioService =
    inject(AudioService);

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {
    /*
     * Inicia la música principal de la aventura
     * al entrar a la pantalla de inicio.
     *
     * AudioService se encarga de evitar que
     * home.mp3 se reinicie innecesariamente.
     */
    this.audioService.playHomeMusic();
  }

  // =========================================================
  // AYUDA
  // =========================================================

  openHelp(): void {
    const dialog =
      this.helpDialog.nativeElement;

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  // =========================================================
  // CERRAR DIALOG AL HACER CLIC FUERA
  // =========================================================

  closeOnBackdrop(
    event: MouseEvent
  ): void {
    const dialog =
      this.helpDialog.nativeElement;

    if (event.target !== dialog) {
      return;
    }

    const rect =
      dialog.getBoundingClientRect();

    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedOutside) {
      dialog.close();
    }
  }
}