import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Button],
  template: `
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-slate-50"
      ></div>
      <div
        class="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24"
      >
        <div>
          <span
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            <i class="pi pi-sparkles"></i>
            Impulsado por OpenAI
          </span>
          <h1
            class="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl"
          >
            Convierte tus audios en
            <span class="text-indigo-600">texto</span> en segundos
          </h1>
          <p class="mt-5 max-w-xl text-lg text-slate-600">
            Sube archivos <strong>mp3</strong> o <strong>wav</strong>, obtén la
            transcripcion automatica en espanol, revisala, corrigela y guarda un
            historial completo de cambios.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            @if (auth.isAuthenticated()) {
              <p-button
                label="Ir al panel"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="large"
                routerLink="/app/dashboard"
              />
            } @else {
              <p-button
                label="Comenzar gratis"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="large"
                routerLink="/register"
              />
              <p-button
                label="Ya tengo cuenta"
                severity="secondary"
                [outlined]="true"
                size="large"
                routerLink="/login"
              />
            }
          </div>
        </div>

        <div class="relative">
          <div
            class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100"
          >
            <div class="mb-4 flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-red-400"></span>
              <span class="h-3 w-3 rounded-full bg-amber-400"></span>
              <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
            </div>
            <div class="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <i class="pi pi-volume-up text-indigo-600 text-xl"></i>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div class="h-full w-2/3 rounded-full bg-indigo-500"></div>
              </div>
              <span class="text-xs text-slate-500">reunion.mp3</span>
            </div>
            <div
              class="rounded-lg border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700"
            >
              <p class="mb-2 text-xs font-semibold uppercase text-indigo-500">
                Transcripcion
              </p>
              <p>
                Buenos dias, en la reunion de hoy revisamos los avances del
                proyecto y definimos los siguientes pasos para el equipo...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 class="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        Todo lo que necesitas
      </h2>
      <p class="mt-3 text-center text-slate-600">
        Una herramienta simple para transformar audio en texto utilizable.
      </p>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (feature of features; track feature.title) {
          <div
            class="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div
              class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
            >
              <i class="pi {{ feature.icon }} text-lg"></i>
            </div>
            <h3 class="mb-2 font-semibold text-slate-800">{{ feature.title }}</h3>
            <p class="text-sm text-slate-600">{{ feature.description }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class Landing {
  protected readonly auth = inject(AuthService);

  protected readonly features = [
    {
      icon: 'pi-file',
      title: 'Sube mp3 o wav',
      description:
        'Carga tus audios de forma directa. Validamos el formato y el tamano antes de procesarlos.',
    },
    {
      icon: 'pi-language',
      title: 'Transcripcion en espanol',
      description:
        'Usamos el modelo gpt-transcribe de OpenAI optimizado para transcribir voz en espanol.',
    },
    {
      icon: 'pi-pencil',
      title: 'Revisa y corrige',
      description:
        'Edita el texto obtenido para ajustar nombres, terminos tecnicos o errores de reconocimiento.',
    },
    {
      icon: 'pi-history',
      title: 'Historial de cambios',
      description:
        'Cada correccion queda registrada con el texto anterior, el nuevo, quien edito y cuando.',
    },
    {
      icon: 'pi-shield',
      title: 'Acceso seguro',
      description:
        'Autenticacion con JWT y control de acceso por roles para proteger tu informacion.',
    },
    {
      icon: 'pi-lock',
      title: 'Tu audio no se almacena',
      description:
        'El archivo de audio se procesa en memoria y se descarta. Solo guardamos el texto y su metadata.',
    },
  ];
}
