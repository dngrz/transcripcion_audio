package com.transcripcion.gestion.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTranscriptionRequest(
        @NotBlank(message = "El texto corregido es obligatorio")
        String correctedText
) {
}
