package com.transcripcion.gestion.util;

import com.transcripcion.gestion.exception.BusinessException;
import com.transcripcion.gestion.exception.UnsupportedAudioFormatException;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
public class AudioFileValidator {

    public static final long MAX_SIZE_BYTES = 25L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp3", "wav");

    public AudioFileInfo validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("El archivo de audio es obligatorio");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException(
                    "El archivo excede el tamano maximo permitido (25 MB)",
                    HttpStatus.PAYLOAD_TOO_LARGE);
        }

        String filename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "audio" : file.getOriginalFilename());
        String extension = extractExtension(filename);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new UnsupportedAudioFormatException(
                    "Formato no soportado. Solo se permiten archivos mp3 o wav");
        }

        return new AudioFileInfo(filename, extension, file.getSize());
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    public record AudioFileInfo(String filename, String format, long sizeBytes) {

        public String mediaType() {
            return "wav".equals(format) ? "audio/wav" : "audio/mpeg";
        }
    }
}
