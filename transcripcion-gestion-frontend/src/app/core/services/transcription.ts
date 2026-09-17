import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';
import {
  PageResponse,
  Transcription,
  TranscriptionRevision,
  TranscriptionSummary,
} from '../models/transcription.model';

@Injectable({ providedIn: 'root' })
export class TranscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/transcriptions`;

  transcribe(file: File): Observable<Transcription> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<Transcription>(this.baseUrl, formData);
  }

  list(
    mine: boolean,
    page: number,
    size: number,
  ): Observable<PageResponse<TranscriptionSummary>> {
    const params = new HttpParams()
      .set('mine', mine)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<TranscriptionSummary>>(this.baseUrl, {
      params,
    });
  }

  getById(id: number): Observable<Transcription> {
    return this.http.get<Transcription>(`${this.baseUrl}/${id}`);
  }

  update(id: number, correctedText: string): Observable<Transcription> {
    return this.http.put<Transcription>(`${this.baseUrl}/${id}`, {
      correctedText,
    });
  }

  getRevisions(id: number): Observable<TranscriptionRevision[]> {
    return this.http.get<TranscriptionRevision[]>(
      `${this.baseUrl}/${id}/revisions`,
    );
  }
}
