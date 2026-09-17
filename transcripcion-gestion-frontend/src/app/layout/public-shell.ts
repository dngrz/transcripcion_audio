import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, RouterLink, Button],
  template: `
    <div class="flex min-h-screen flex-col bg-slate-50">
      <header
        class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur"
      >
        <div
          class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3"
        >
          <a
            routerLink="/"
            class="flex items-center gap-2 text-lg font-semibold text-slate-800"
          >
            <i class="pi pi-microphone text-indigo-600 text-xl"></i>
            <span>Transcripcion<span class="text-indigo-600">Audio</span></span>
          </a>
          <nav class="flex items-center gap-2">
            @if (auth.isAuthenticated()) {
              <p-button
                label="Ir al panel"
                icon="pi pi-arrow-right"
                iconPos="right"
                routerLink="/app/dashboard"
              />
            } @else {
              <p-button
                label="Iniciar sesion"
                severity="secondary"
                [text]="true"
                routerLink="/login"
              />
              <p-button label="Crear cuenta" routerLink="/register" />
            }
          </nav>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="border-t border-slate-200 bg-white">
        <div
          class="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>© {{ year }} TranscripcionAudio. Todos los derechos reservados.</span>
          <span>Transcripcion de audio mp3 y wav con OpenAI</span>
        </div>
      </footer>
    </div>
  `,
})
export class PublicShell {
  protected readonly auth = inject(AuthService);
  protected readonly year = new Date().getFullYear();
}
