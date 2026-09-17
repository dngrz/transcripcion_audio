package com.transcripcion.gestion.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenAiDetectedLanguage(
        @JsonProperty("code") String code
) {
}
