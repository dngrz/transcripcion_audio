package com.transcripcion.gestion.service.impl;

import com.transcripcion.gestion.dto.AuthResponse;
import com.transcripcion.gestion.dto.LoginRequest;
import com.transcripcion.gestion.dto.RegisterRequest;
import com.transcripcion.gestion.dto.UserDto;
import com.transcripcion.gestion.exception.BusinessException;
import com.transcripcion.gestion.mapper.UserMapper;
import com.transcripcion.gestion.model.Role;
import com.transcripcion.gestion.model.User;
import com.transcripcion.gestion.repository.UserRepository;
import com.transcripcion.gestion.security.CustomUserDetails;
import com.transcripcion.gestion.security.JwtService;
import com.transcripcion.gestion.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(
                    "Ya existe un usuario registrado con el email indicado",
                    HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .role(Role.USER)
                .enabled(true)
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales invalidas");
        }
        if (!user.isEnabled()) {
            throw new BusinessException("El usuario se encuentra deshabilitado", HttpStatus.FORBIDDEN);
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);
        UserDto userDto = userMapper.toDto(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), userDto);
    }
}
