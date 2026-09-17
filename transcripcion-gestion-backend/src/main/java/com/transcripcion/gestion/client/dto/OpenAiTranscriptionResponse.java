package com.transcripcion.gestion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenAiTranscriptionResponse(
        @JsonProperty("text") String text,
        @JsonProperty("languages") List<OpenAiDetectedLanguage> languages
) {
}
