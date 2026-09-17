package com.transcripcion.gestion.service.impl;

import com.transcripcion.gestion.client.OpenAiTranscriptionApi;
import com.transcripcion.gestion.client.dto.OpenAiTranscriptionResponse;
import com.transcripcion.gestion.dto.PageResponse;
import com.transcripcion.gestion.dto.TranscriptionResponse;
import com.transcripcion.gestion.dto.TranscriptionRevisionDto;
import com.transcripcion.gestion.dto.TranscriptionSummaryDto;
import com.transcripcion.gestion.dto.UpdateTranscriptionRequest;
import com.transcripcion.gestion.exception.BusinessException;
import com.transcripcion.gestion.exception.ResourceNotFoundException;
import com.transcripcion.gestion.mapper.TranscriptionMapper;
import com.transcripcion.gestion.model.Transcription;
import com.transcripcion.gestion.model.TranscriptionRevision;
import com.transcripcion.gestion.model.TranscriptionStatus;
import com.transcripcion.gestion.repository.TranscriptionRepository;
import com.transcripcion.gestion.repository.TranscriptionRevisionRepository;
import com.transcripcion.gestion.security.CustomUserDetails;
import com.transcripcion.gestion.service.TranscriptionService;
import com.transcripcion.gestion.util.AudioFileValidator;
import com.transcripcion.gestion.util.AudioFileValidator.AudioFileInfo;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import retrofit2.Response;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranscriptionServiceImpl implements TranscriptionService {

    private final TranscriptionRepository transcriptionRepository;
    private final TranscriptionRevisionRepository revisionRepository;
    private final TranscriptionMapper transcriptionMapper;
    private final AudioFileValidator audioFileValidator;
    private final OpenAiTranscriptionApi openAiTranscriptionApi;

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Value("${app.openai.model}")
    private String model;

    @Value("${app.openai.language}")
    private String language;

    @Override
    @Transactional
    public TranscriptionResponse transcribe(MultipartFile file, CustomUserDetails currentUser) {
        AudioFileInfo info = audioFileValidator.validate(file);
        OpenAiTranscriptionResponse openAiResponse = requestTranscription(file, info);

        String detectedLanguage = Optional.ofNullable(openAiResponse.languages())
                .filter(languages -> !languages.isEmpty())
                .map(languages -> languages.get(0).code())
                .filter(StringUtils::hasText)
                .orElse(language);

        Transcription transcription = Transcription.builder()
                .user(currentUser.getUser())
                .originalFilename(info.filename())
                .format(info.format())
                .sizeBytes(info.sizeBytes())
                .language(detectedLanguage)
                .transcribedText(openAiResponse.text())
                .status(TranscriptionStatus.PENDIENTE_REVISION)
                .build();

        transcriptionRepository.save(transcription);
        return transcriptionMapper.toResponse(transcription);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TranscriptionSummaryDto> list(
            boolean mine, int page, int size, CustomUserDetails currentUser) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Transcription> result = mine
                ? transcriptionRepository.findByUserId(currentUser.getId(), pageable)
                : transcriptionRepository.findAll(pageable);

        List<TranscriptionSummaryDto> content = result.getContent().stream()
                .map(transcriptionMapper::toSummary)
                .toList();

        return new PageResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public TranscriptionResponse getById(Long id, CustomUserDetails currentUser) {
        Transcription transcription = findTranscription(id);
        return transcriptionMapper.toResponse(transcription);
    }

    @Override
    @Transactional
    public TranscriptionResponse update(
            Long id, UpdateTranscriptionRequest request, CustomUserDetails currentUser) {

        Transcription transcription = findTranscription(id);
        String previousText = transcription.getTranscribedText();
        String correctedText = request.correctedText();

        if (!correctedText.equals(previousText)) {
            revisionRepository.save(TranscriptionRevision.builder()
                    .transcription(transcription)
                    .previousText(previousText)
                    .newText(correctedText)
                    .editedBy(currentUser.getUser())
                    .build());

            transcription.setTranscribedText(correctedText);
            transcription.setStatus(TranscriptionStatus.REVISADA);
            transcriptionRepository.save(transcription);
        }

        return transcriptionMapper.toResponse(transcription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranscriptionRevisionDto> getRevisions(Long id, CustomUserDetails currentUser) {
        findTranscription(id);
        return revisionRepository.findByTranscriptionIdOrderByEditedAtDesc(id).stream()
                .map(transcriptionMapper::toRevisionDto)
                .toList();
    }

    private Transcription findTranscription(Long id) {
        return transcriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe una transcripcion con id " + id));
    }

    private OpenAiTranscriptionResponse requestTranscription(
            MultipartFile file, AudioFileInfo info) {

        if (!StringUtils.hasText(apiKey)) {
            throw new BusinessException(
                    "La API key de OpenAI no esta configurada (OPENAI_API_KEY)",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }

        try {
            byte[] audioBytes = file.getBytes();

            RequestBody audioBody = RequestBody.create(audioBytes, MediaType.parse(info.mediaType()));
            MultipartBody.Part filePart =
                    MultipartBody.Part.createFormData("file", info.filename(), audioBody);
            RequestBody modelPart = RequestBody.create(model, MediaType.parse("text/plain"));
            RequestBody languagePart = RequestBody.create(language, MediaType.parse("text/plain"));

            Response<OpenAiTranscriptionResponse> response = openAiTranscriptionApi
                    .transcribe(
                            "Bearer " + apiKey,
                            filePart,
                            modelPart,
                            List.of(languagePart),
                            null)
                    .execute();

            if (!response.isSuccessful()) {
                String errorBody = response.errorBody() == null
                        ? "sin detalle"
                        : response.errorBody().string();
                log.error("Error de OpenAI ({}): {}", response.code(), errorBody);
                throw new BusinessException(
                        "Error al transcribir con OpenAI (HTTP " + response.code() + ")",
                        HttpStatus.BAD_GATEWAY);
            }

            OpenAiTranscriptionResponse body = response.body();
            if (body == null || !StringUtils.hasText(body.text())) {
                throw new BusinessException(
                        "OpenAI no devolvio texto para el audio enviado",
                        HttpStatus.BAD_GATEWAY);
            }
            return body;
        } catch (IOException ex) {
            throw new BusinessException(
                    "No se pudo leer o enviar el archivo de audio",
                    HttpStatus.BAD_GATEWAY);
        }
    }
}
