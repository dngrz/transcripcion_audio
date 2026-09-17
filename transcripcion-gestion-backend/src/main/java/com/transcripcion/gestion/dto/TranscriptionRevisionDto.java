package com.transcripcion.gestion.dto;

import java.time.LocalDateTime;

public record TranscriptionRevisionDto(
        Long id,
        String previousText,
        String newText,
        String editedByEmail,
        LocalDateTime editedAt
) {
}
