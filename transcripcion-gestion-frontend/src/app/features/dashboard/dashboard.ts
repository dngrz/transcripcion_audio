import { Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { TranscriptionService } from '../../core/services/transcription';
import { TranscriptionSummary } from '../../core/models/transcription.model';

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['mp3', 'wav'];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Button, ProgressBar, Tag, TableModule, SlicePipe],
  template: `
    <div class="mx-auto w-full max-w-5xl">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">
          Hola, {{ auth.user()?.fullName }}
        </h1>
        <p class="mt-1 text-sm text-slate-600">
          Sube un audio en formato mp3 o wav y obten tu transcripcion.
        </p>
      </header>

      <section class="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div
          class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition"
          [class.border-indigo-400]="dragOver()"
          [class.bg-indigo-50]="dragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <i class="pi pi-cloud-upload mb-4 text-4xl text-indigo-500"></i>
          <p class="text-sm font-medium text-slate-700">
            Arrastra tu audio aqui o selecciona un archivo
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Formatos permitidos: .mp3 y .wav — tamano maximo 25 MB
          </p>

          <input
            #fileInput
            type="file"
            class="hidden"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            (change)="onFileChange($event)"
          />

          <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
            <p-button
              label="Seleccionar archivo"
              icon="pi pi-folder-open"
              severity="secondary"
              [outlined]="true"
              (onClick)="fileInput.click()"
              [disabled]="loading()"
            />
            <p-button
              label="Transcribir"
              icon="pi pi-microphone"
              (onClick)="transcribe()"
              [disabled]="!selectedFile()"
              [loading]="loading()"
            />
          </div>

          @if (selectedFile(); as file) {
            <div
              class="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            >
              <i class="pi pi-file"></i>
              <span class="max-w-xs truncate">{{ file.name }}</span>
              <span class="text-xs text-slate-400">{{ formatSize(file.size) }}</span>
              <button
                type="button"
                class="text-slate-400 hover:text-red-500"
                (click)="clearSelection()"
                [disabled]="loading()"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          }
        </div>

        @if (loading()) {
          <p-progressbar mode="indeterminate" styleClass="mt-5 h-2" />
          <p class="mt-2 text-center text-xs text-slate-500">
            Enviando audio a OpenAI y generando la transcripcion...
          </p>
        }
      </section>

      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-800">
            Transcripciones recientes
          </h2>
          <a
            routerLink="/app/transcripciones"
            class="text-sm font-medium text-indigo-600 hover:underline"
          >
            Ver historico completo
          </a>
        </div>

        <p-table
          [value]="recent()"
          [loading]="loadingList()"
          styleClass="p-datatable-sm"
          [tableStyle]="{ 'min-width': '40rem' }"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Archivo</th>
              <th>Formato</th>
              <th>Idioma</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td class="max-w-xs truncate">{{ item.originalFilename }}</td>
              <td class="uppercase">{{ item.format }}</td>
              <td class="uppercase">{{ item.language }}</td>
              <td>
                <p-tag
                  [value]="statusLabel(item.status)"
                  [severity]="statusSeverity(item.status)"
                />
              </td>
              <td>{{ item.createdAt | slice: 0 : 10 }}</td>
              <td>
                <p-button
                  label="Ver"
                  icon="pi pi-eye"
                  severity="secondary"
                  [text]="true"
                  [routerLink]="['/app/transcripciones', item.id]"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="py-6 text-center text-sm text-slate-500">
                Aun no registras transcripciones.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </section>
    </div>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly transcriptionService = inject(TranscriptionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly dragOver = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadingList = signal(false);
  protected readonly recent = signal<TranscriptionSummary[]>([]);

  constructor() {
    this.loadRecent();
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (file) {
      this.selectFile(file);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectFile(file);
    }
  }

  protected clearSelection(): void {
    this.selectedFile.set(null);
  }

  protected transcribe(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.transcriptionService.transcribe(file).subscribe({
      next: (transcription) => {
        this.notification.success(
          'Transcripcion lista',
          'Revisa y corrige el texto si es necesario',
        );
        void this.router.navigate(['/app/transcripciones', transcription.id]);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected statusLabel(status: string): string {
    return status === 'REVISADA' ? 'Revisada' : 'Pendiente';
  }

  protected statusSeverity(status: string): 'success' | 'warn' {
    return status === 'REVISADA' ? 'success' : 'warn';
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private selectFile(file: File): void {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      this.notification.error(
        'Formato no soportado',
        'Solo se permiten archivos mp3 o wav',
      );
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      this.notification.error(
        'Archivo muy grande',
        'El tamano maximo permitido es 25 MB',
      );
      return;
    }
    this.selectedFile.set(file);
  }

  private loadRecent(): void {
    this.loadingList.set(true);
    this.transcriptionService.list(true, 0, 5).subscribe({
      next: (page) => this.recent.set(page.content),
      error: () => this.loadingList.set(false),
      complete: () => this.loadingList.set(false),
    });
  }
}
