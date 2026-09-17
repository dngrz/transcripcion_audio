package com.transcripcion.gestion.dto;

import com.transcripcion.gestion.model.TranscriptionStatus;
import java.time.LocalDateTime;

public record TranscriptionSummaryDto(
        Long id,
        String originalFilename,
        String format,
        Long sizeBytes,
        String language,
        TranscriptionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String ownerEmail
) {
}
