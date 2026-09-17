package com.transcripcion.gestion.expose.web;

import com.transcripcion.gestion.dto.PageResponse;
import com.transcripcion.gestion.dto.TranscriptionResponse;
import com.transcripcion.gestion.dto.TranscriptionRevisionDto;
import com.transcripcion.gestion.dto.TranscriptionSummaryDto;
import com.transcripcion.gestion.dto.UpdateTranscriptionRequest;
import com.transcripcion.gestion.security.CustomUserDetails;
import com.transcripcion.gestion.service.TranscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/transcriptions")
@RequiredArgsConstructor
@Tag(name = "Transcripciones", description = "Subida, listado, edicion e historial")
public class TranscriptionController {

    private final TranscriptionService transcriptionService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir un audio (mp3/wav) y transcribirlo")
    public ResponseEntity<TranscriptionResponse> transcribe(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transcriptionService.transcribe(file, currentUser));
    }

    @GetMapping
    @Operation(summary = "Listar transcripciones (opcionalmente solo las propias)")
    public ResponseEntity<PageResponse<TranscriptionSummaryDto>> list(
            @RequestParam(defaultValue = "false") boolean mine,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(transcriptionService.list(mine, page, size, currentUser));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle de una transcripcion")
    public ResponseEntity<TranscriptionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(transcriptionService.getById(id, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Corregir el texto de una transcripcion")
    public ResponseEntity<TranscriptionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTranscriptionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(transcriptionService.update(id, request, currentUser));
    }

    @GetMapping("/{id}/revisions")
    @Operation(summary = "Historial de correcciones de una transcripcion")
    public ResponseEntity<List<TranscriptionRevisionDto>> revisions(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(transcriptionService.getRevisions(id, currentUser));
    }
}
