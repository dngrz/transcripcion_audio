package com.transcripcion.gestion.repository;

import com.transcripcion.gestion.model.TranscriptionRevision;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TranscriptionRevisionRepository
        extends JpaRepository<TranscriptionRevision, Long> {

    List<TranscriptionRevision> findByTranscriptionIdOrderByEditedAtDesc(Long transcriptionId);
}
