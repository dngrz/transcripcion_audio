import { Component, computed, inject, signal } from '@angular/core';
import { SlicePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { NotificationService } from '../../core/services/notification';
import { TranscriptionService } from '../../core/services/transcription';
import {
  Transcription,
  TranscriptionRevision,
} from '../../core/models/transcription.model';

@Component({
  selector: 'app-transcription-detail',
  imports: [
    FormsModule,
    RouterLink,
    Button,
    Textarea,
    TableModule,
    Tag,
    SlicePipe,
    UpperCasePipe,
  ],
  template: `
    <div class="mx-auto w-full max-w-5xl">
      <div class="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <a routerLink="/app/transcripciones" class="hover:text-indigo-600">
          Historico
        </a>
        <i class="pi pi-angle-right text-xs"></i>
        <span>Detalle</span>
      </div>

      @if (transcription(); as item) {
        <header
          class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0">
            <h1 class="flex items-center gap-3 text-xl font-bold text-slate-900">
              <span class="truncate">{{ item.originalFilename }}</span>
              <p-tag
                [value]="statusLabel(item.status)"
                [severity]="statusSeverity(item.status)"
              />
            </h1>
            <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span><i class="pi pi-file mr-1"></i>{{ item.format | uppercase }}</span>
              <span><i class="pi pi-language mr-1"></i>{{ item.language | uppercase }}</span>
              <span><i class="pi pi-database mr-1"></i>{{ item.sizeBytes }} bytes</span>
              <span><i class="pi pi-user mr-1"></i>{{ item.owner.fullName }}</span>
              <span>
                <i class="pi pi-calendar mr-1"></i>{{ item.createdAt | slice: 0 : 19 }}
              </span>
            </div>
          </div>
          <p-button
            label="Guardar correccion"
            icon="pi pi-save"
            (onClick)="save()"
            [disabled]="!hasChanges()"
            [loading]="saving()"
          />
        </header>

        <section class="mb-8 rounded-xl border border-slate-200 bg-white p-5">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold uppercase text-slate-500">
              Texto transcrito
            </h2>
            @if (hasChanges()) {
              <span class="text-xs font-medium text-amber-600">
                <i class="pi pi-exclamation-circle mr-1"></i>
                Cambios sin guardar
              </span>
            }
          </div>
          <textarea
            pTextarea
            [ngModel]="editedText()"
            (ngModelChange)="editedText.set($event)"
            [rows]="14"
            class="w-full"
            styleClass="w-full"
            placeholder="Texto de la transcripcion"
          ></textarea>
          <div class="mt-2 flex justify-end text-xs text-slate-400">
            {{ editedText().length }} caracteres
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5">
          <h2 class="mb-4 text-sm font-semibold uppercase text-slate-500">
            Historial de correcciones ({{ revisions().length }})
          </h2>

          @if (revisions().length === 0) {
            <p class="py-4 text-center text-sm text-slate-500">
              Aun no se han realizado correcciones sobre esta transcripcion.
            </p>
          } @else {
            <p-table
              [value]="revisions()"
              dataKey="id"
              styleClass="p-datatable-sm"
              [tableStyle]="{ 'min-width': '36rem' }"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 3rem"></th>
                  <th>Editado por</th>
                  <th>Fecha</th>
                  <th>Resumen</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-revision let-expanded="expanded">
                <tr>
                  <td>
                    <p-button
                      type="button"
                      [pRowToggler]="revision"
                      [text]="true"
                      [rounded]="true"
                      [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                    />
                  </td>
                  <td class="text-slate-700">{{ revision.editedByEmail }}</td>
                  <td class="text-slate-600">
                    {{ revision.editedAt | slice: 0 : 19 }}
                  </td>
                  <td class="text-xs text-slate-500">
                    {{ revision.previousText.length }} → {{ revision.newText.length }}
                    caracteres
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="expandedrow" let-revision>
                <tr>
                  <td colspan="4" class="bg-slate-50">
                    <div class="grid gap-4 p-2 md:grid-cols-2">
                      <div>
                        <p
                          class="mb-1 text-xs font-semibold uppercase text-red-500"
                        >
                          Texto anterior
                        </p>
                        <p
                          class="whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-sm text-slate-600"
                        >
                          {{ revision.previousText }}
                        </p>
                      </div>
                      <div>
                        <p
                          class="mb-1 text-xs font-semibold uppercase text-emerald-600"
                        >
                          Texto nuevo
                        </p>
                        <p
                          class="whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-sm text-slate-700"
                        >
                          {{ revision.newText }}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </section>
      } @else {
        <div class="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <i class="pi pi-spin pi-spinner text-2xl text-indigo-500"></i>
          <p class="mt-3 text-sm text-slate-500">Cargando transcripcion...</p>
        </div>
      }
    </div>
  `,
})
export class TranscriptionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly transcriptionService = inject(TranscriptionService);
  private readonly notification = inject(NotificationService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly transcription = signal<Transcription | null>(null);
  protected readonly revisions = signal<TranscriptionRevision[]>([]);
  protected readonly editedText = signal('');
  protected readonly saving = signal(false);

  protected readonly hasChanges = computed(() => {
    const item = this.transcription();
    return !!item && this.editedText().trim() !== item.transcribedText.trim();
  });

  constructor() {
    this.loadDetail();
    this.loadRevisions();
  }

  protected save(): void {
    if (!this.hasChanges()) {
      return;
    }
    const text = this.editedText();
    if (!text.trim()) {
      this.notification.error(
        'Texto vacio',
        'La transcripcion no puede quedar vacia',
      );
      return;
    }

    this.saving.set(true);
    this.transcriptionService.update(this.id, text).subscribe({
      next: (updated) => {
        this.transcription.set(updated);
        this.editedText.set(updated.transcribedText);
        this.notification.success(
          'Correccion guardada',
          'La transcripcion se actualizo correctamente',
        );
        this.loadRevisions();
      },
      error: () => this.saving.set(false),
      complete: () => this.saving.set(false),
    });
  }

  protected statusLabel(status: string): string {
    return status === 'REVISADA' ? 'Revisada' : 'Pendiente';
  }

  protected statusSeverity(status: string): 'success' | 'warn' {
    return status === 'REVISADA' ? 'success' : 'warn';
  }

  private loadDetail(): void {
    this.transcriptionService.getById(this.id).subscribe((item) => {
      this.transcription.set(item);
      this.editedText.set(item.transcribedText);
    });
  }

  private loadRevisions(): void {
    this.transcriptionService
      .getRevisions(this.id)
      .subscribe((revisions) => this.revisions.set(revisions));
  }
}
