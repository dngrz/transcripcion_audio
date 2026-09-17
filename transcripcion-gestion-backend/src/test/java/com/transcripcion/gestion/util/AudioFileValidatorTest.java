package com.transcripcion.gestion.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.transcripcion.gestion.exception.BusinessException;
import com.transcripcion.gestion.exception.UnsupportedAudioFormatException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class AudioFileValidatorTest {

    private final AudioFileValidator validator = new AudioFileValidator();

    @Test
    void acceptsMp3File() {
        MockMultipartFile file =
                new MockMultipartFile("file", "audio.mp3", "audio/mpeg", new byte[]{1, 2, 3});

        AudioFileValidator.AudioFileInfo info = validator.validate(file);

        assertThat(info.format()).isEqualTo("mp3");
        assertThat(info.filename()).isEqualTo("audio.mp3");
        assertThat(info.mediaType()).isEqualTo("audio/mpeg");
    }

    @Test
    void acceptsWavFile() {
        MockMultipartFile file =
                new MockMultipartFile("file", "audio.wav", "audio/wav", new byte[]{1, 2, 3});

        AudioFileValidator.AudioFileInfo info = validator.validate(file);

        assertThat(info.format()).isEqualTo("wav");
        assertThat(info.mediaType()).isEqualTo("audio/wav");
    }

    @Test
    void rejectsUnsupportedFormat() {
        MockMultipartFile file =
                new MockMultipartFile("file", "audio.txt", "text/plain", new byte[]{1});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(UnsupportedAudioFormatException.class);
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile file =
                new MockMultipartFile("file", "audio.mp3", "audio/mpeg", new byte[0]);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(BusinessException.class);
    }
}
