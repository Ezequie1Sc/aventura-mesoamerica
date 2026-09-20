import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/quiz/pages/home/home').then(
        (component) => component.Home
      ),
  },
  {
    path: 'instrucciones',
    loadComponent: () =>
      import('./features/quiz/pages/instructions/instructions').then(
        (component) => component.Instructions
      ),
  },
  {
    path: 'mapa',
    loadComponent: () =>
      import('./features/quiz/pages/map/map').then(
        (component) => component.Map
      ),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./features/quiz/pages/question/question').then(
        (component) => component.Question
      ),
  },
  {
    path: 'resultado',
    loadComponent: () =>
      import('./features/quiz/pages/result/result').then(
        (component) => component.Result
      ),
  },
  {
    path: 'insignias',
    loadComponent: () =>
      import('./features/quiz/pages/badges/badges').then(
        (component) => component.Badges
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];