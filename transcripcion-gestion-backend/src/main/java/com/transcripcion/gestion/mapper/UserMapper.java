package com.transcripcion.gestion.mapper;

import com.transcripcion.gestion.dto.UserDto;
import com.transcripcion.gestion.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);
}
