package com.transcripcion.gestion.dto;

import com.transcripcion.gestion.model.Role;
import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
}
