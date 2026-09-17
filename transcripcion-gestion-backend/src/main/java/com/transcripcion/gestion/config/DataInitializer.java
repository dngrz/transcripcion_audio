package com.transcripcion.gestion.config;

import com.transcripcion.gestion.model.Role;
import com.transcripcion.gestion.model.User;
import com.transcripcion.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@transcripcion.local}")
    private String adminEmail;

    @Value("${app.admin.password:Admin123*}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        userRepository.save(User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .fullName("Administrador")
                .role(Role.ADMIN)
                .enabled(true)
                .build());
        log.info("Usuario administrador creado con email '{}'", adminEmail);
    }
}
