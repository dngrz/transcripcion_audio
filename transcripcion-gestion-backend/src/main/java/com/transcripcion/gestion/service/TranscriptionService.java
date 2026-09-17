package com.transcripcion.gestion.service;

import com.transcripcion.gestion.dto.PageResponse;
import com.transcripcion.gestion.dto.TranscriptionResponse;
import com.transcripcion.gestion.dto.TranscriptionRevisionDto;
import com.transcripcion.gestion.dto.TranscriptionSummaryDto;
import com.transcripcion.gestion.dto.UpdateTranscriptionRequest;
import com.transcripcion.gestion.security.CustomUserDetails;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface TranscriptionService {

    TranscriptionResponse transcribe(MultipartFile file, CustomUserDetails currentUser);

    PageResponse<TranscriptionSummaryDto> list(
            boolean mine, int page, int size, CustomUserDetails currentUser);

    TranscriptionResponse getById(Long id, CustomUserDetails currentUser);

    TranscriptionResponse update(
            Long id, UpdateTranscriptionRequest request, CustomUserDetails currentUser);

    List<TranscriptionRevisionDto> getRevisions(Long id, CustomUserDetails currentUser);
}
