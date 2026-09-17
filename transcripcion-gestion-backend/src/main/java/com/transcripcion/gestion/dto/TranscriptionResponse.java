package com.transcripcion.gestion.dto;

import com.transcripcion.gestion.model.TranscriptionStatus;
import java.time.LocalDateTime;

public record TranscriptionResponse(
        Long id,
        String originalFilename,
        String format,
        Long sizeBytes,
        String language,
        String transcribedText,
        TranscriptionStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UserDto owner
) {
}
