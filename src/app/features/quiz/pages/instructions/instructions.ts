import {
  Component,
  inject,
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { AudioService } from '../../../../core/services/audio.service';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss',
})
export class Instructions {
  readonly audioService = inject(AudioService);
}