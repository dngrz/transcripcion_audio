package com.transcripcion.gestion.mapper;

import com.transcripcion.gestion.dto.TranscriptionResponse;
import com.transcripcion.gestion.dto.TranscriptionRevisionDto;
import com.transcripcion.gestion.dto.TranscriptionSummaryDto;
import com.transcripcion.gestion.model.Transcription;
import com.transcripcion.gestion.model.TranscriptionRevision;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TranscriptionMapper {

    @Mapping(target = "owner", source = "user")
    TranscriptionResponse toResponse(Transcription transcription);

    @Mapping(target = "ownerEmail", source = "user.email")
    TranscriptionSummaryDto toSummary(Transcription transcription);

    @Mapping(target = "editedByEmail", source = "editedBy.email")
    TranscriptionRevisionDto toRevisionDto(TranscriptionRevision revision);
}
