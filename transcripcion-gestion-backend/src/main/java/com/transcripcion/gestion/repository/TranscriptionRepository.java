package com.transcripcion.gestion.repository;

import com.transcripcion.gestion.model.Transcription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TranscriptionRepository extends JpaRepository<Transcription, Long> {

    Page<Transcription> findByUserId(Long userId, Pageable pageable);
}
