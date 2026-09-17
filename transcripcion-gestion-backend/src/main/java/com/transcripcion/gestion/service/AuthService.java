package com.transcripcion.gestion.service;

import com.transcripcion.gestion.dto.AuthResponse;
import com.transcripcion.gestion.dto.LoginRequest;
import com.transcripcion.gestion.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
