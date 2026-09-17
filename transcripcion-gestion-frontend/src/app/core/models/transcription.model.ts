import { User } from './auth.model';

export type TranscriptionStatus = 'PENDIENTE_REVISION' | 'REVISADA';

export interface TranscriptionSummary {
  id: number;
  originalFilename: string;
  format: string;
  sizeBytes: number;
  language: string;
  status: TranscriptionStatus;
  createdAt: string;
  updatedAt: string;
  ownerEmail: string;
}

export interface Transcription {
  id: number;
  originalFilename: string;
  format: string;
  sizeBytes: number;
  language: string;
  transcribedText: string;
  status: TranscriptionStatus;
  createdAt: string;
  updatedAt: string;
  owner: User;
}

export interface TranscriptionRevision {
  id: number;
  previousText: string;
  newText: string;
  editedByEmail: string;
  editedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
