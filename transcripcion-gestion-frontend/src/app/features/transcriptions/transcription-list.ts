import { Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TranscriptionService } from '../../core/services/transcription';
import { TranscriptionSummary } from '../../core/models/transcription.model';

@Component({
  selector: 'app-transcription-list',
  imports: [
    RouterLink,
    Button,
    ToggleSwitch,
    TableModule,
    Tag,
    FormsModule,
    SlicePipe,
  ],
  template: `
    <div class="mx-auto w-full max-w-6xl">
      <header
        class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Historico</h1>
          <p class="mt-1 text-sm text-slate-600">
            Consulta, revisa y corrige tus transcripciones.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-600">Solo mis transcripciones</span>
          <p-toggleswitch
            [ngModel]="mine()"
            (onChange)="onMineChange($event.checked)"
          />
          <p-button label="Nueva" icon="pi pi-plus" routerLink="/app/dashboard" />
        </div>
      </header>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p-table
          [value]="items()"
          [lazy]="true"
          [paginator]="true"
          [rows]="size()"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          (onLazyLoad)="load($event)"
          styleClass="p-datatable-sm"
          [tableStyle]="{ 'min-width': '52rem' }"
          [rowsPerPageOptions]="[5, 10, 20]"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="originalFilename">Archivo</th>
              <th>Formato</th>
              <th>Tamano</th>
              <th>Idioma</th>
              <th>Estado</th>
              <th>Propietario</th>
              <th pSortableColumn="createdAt">Fecha</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td class="max-w-xs truncate font-medium text-slate-700">
                {{ item.originalFilename }}
              </td>
              <td class="uppercase">{{ item.format }}</td>
              <td>{{ formatSize(item.sizeBytes) }}</td>
              <td class="uppercase">{{ item.language }}</td>
              <td>
                <p-tag
                  [value]="statusLabel(item.status)"
                  [severity]="statusSeverity(item.status)"
                />
              </td>
              <td class="text-slate-600">{{ item.ownerEmail }}</td>
              <td>{{ item.createdAt | slice: 0 : 10 }}</td>
              <td>
                <p-button
                  label="Revisar"
                  icon="pi pi-pencil"
                  severity="secondary"
                  [text]="true"
                  [routerLink]="['/app/transcripciones', item.id]"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="py-8 text-center text-sm text-slate-500">
                No hay transcripciones para mostrar.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class TranscriptionList {
  private readonly transcriptionService = inject(TranscriptionService);

  protected readonly items = signal<TranscriptionSummary[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly mine = signal(false);
  protected readonly size = signal(10);

  private readonly page = signal(0);

  protected load(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? 10;
    const first = event.first ?? 0;
    this.size.set(rows);
    this.page.set(Math.floor(first / rows));
    this.fetch();
  }

  protected onMineChange(mine: boolean): void {
    this.mine.set(mine);
    this.page.set(0);
    this.fetch();
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

  private fetch(): void {
    this.loading.set(true);
    this.transcriptionService
      .list(this.mine(), this.page(), this.size())
      .subscribe({
        next: (page) => {
          this.items.set(page.content);
          this.totalRecords.set(page.totalElements);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }
}
