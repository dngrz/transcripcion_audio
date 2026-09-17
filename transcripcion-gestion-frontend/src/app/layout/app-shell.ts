import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Tag],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <aside
        class="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex"
      >
        <a
          routerLink="/app/dashboard"
          class="mb-8 flex items-center gap-2 text-lg font-semibold text-slate-800"
        >
          <i class="pi pi-microphone text-indigo-600 text-xl"></i>
          <span>Transcripcion<span class="text-indigo-600">Audio</span></span>
        </a>

        <nav class="flex flex-1 flex-col gap-1">
          <a
            routerLink="/app/dashboard"
            routerLinkActive="bg-indigo-50 text-indigo-700"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <i class="pi pi-th-large"></i>
            <span>Panel</span>
          </a>
          <a
            routerLink="/app/transcripciones"
            routerLinkActive="bg-indigo-50 text-indigo-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <i class="pi pi-list"></i>
            <span>Historico</span>
          </a>
        </nav>

        <div class="mt-auto rounded-lg bg-slate-50 p-3">
          <div class="mb-2 flex items-center gap-2">
            <i class="pi pi-user text-slate-500"></i>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-700">
                {{ auth.user()?.fullName }}
              </p>
              <p class="truncate text-xs text-slate-400">
                {{ auth.user()?.email }}
              </p>
            </div>
          </div>
          @if (auth.isAdmin()) {
            <p-tag value="ADMIN" severity="contrast" styleClass="w-full" />
          } @else {
            <p-tag value="USUARIO" severity="info" styleClass="w-full" />
          }
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"
        >
          <div class="flex items-center gap-3 lg:hidden">
            <i class="pi pi-microphone text-indigo-600 text-xl"></i>
            <span class="font-semibold text-slate-800">TranscripcionAudio</span>
          </div>
          <div class="hidden text-sm text-slate-500 lg:block">
            Sistema de transcripcion de audios
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden text-sm text-slate-600 sm:inline">
              {{ auth.user()?.fullName }}
            </span>
            <p-button
              label="Salir"
              icon="pi pi-sign-out"
              severity="secondary"
              [text]="true"
              (onClick)="auth.logout()"
            />
          </div>
        </header>

        <main class="flex-1 p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppShell {
  protected readonly auth = inject(AuthService);
}
