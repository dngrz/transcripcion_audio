import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { AppShell } from './layout/app-shell';
import { PublicShell } from './layout/public-shell';

export const routes: Routes = [
  {
    path: '',
    component: PublicShell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/landing/landing').then((m) => m.Landing),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: 'app',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transcripciones',
        loadComponent: () =>
          import('./features/transcriptions/transcription-list').then(
            (m) => m.TranscriptionList,
          ),
      },
      {
        path: 'transcripciones/:id',
        loadComponent: () =>
          import('./features/transcriptions/transcription-detail').then(
            (m) => m.TranscriptionDetail,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
