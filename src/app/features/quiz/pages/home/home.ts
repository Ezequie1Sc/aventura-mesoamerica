import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @ViewChild('helpDialog')
  private helpDialog!: ElementRef<HTMLDialogElement>;

  openHelp(): void {
    const dialog = this.helpDialog.nativeElement;

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  closeOnBackdrop(event: MouseEvent): void {
    const dialog = this.helpDialog.nativeElement;

    if (event.target !== dialog) {
      return;
    }

    const rect = dialog.getBoundingClientRect();

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