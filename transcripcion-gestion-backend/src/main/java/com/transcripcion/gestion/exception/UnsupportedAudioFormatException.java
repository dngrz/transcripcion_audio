package com.transcripcion.gestion.exception;

import org.springframework.http.HttpStatus;

public class UnsupportedAudioFormatException extends BusinessException {

    public UnsupportedAudioFormatException(String message) {
        super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
}
