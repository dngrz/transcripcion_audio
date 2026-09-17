package com.transcripcion.gestion.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transcription_revisions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transcription_id", nullable = false)
    private Transcription transcription;

    @Column(name = "previous_text", nullable = false, columnDefinition = "text")
    private String previousText;

    @Column(name = "new_text", nullable = false, columnDefinition = "text")
    private String newText;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "edited_by_user_id", nullable = false)
    private User editedBy;

    @Column(name = "edited_at", nullable = false)
    private LocalDateTime editedAt;

    @PrePersist
    void onCreate() {
        this.editedAt = LocalDateTime.now();
    }
}
