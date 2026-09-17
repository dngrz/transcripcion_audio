package com.transcripcion.gestion.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.transcripcion.gestion.model.Role;
import com.transcripcion.gestion.model.User;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET =
            "test-secret-key-with-enough-length-for-hmac-sha-256-0123456789";

    private final JwtService jwtService = new JwtService(SECRET, 3600000L);

    @Test
    void generatesAndValidatesToken() {
        User user = User.builder()
                .id(1L)
                .email("user@test.com")
                .passwordHash("hash")
                .fullName("Test User")
                .role(Role.USER)
                .enabled(true)
                .build();
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("user@test.com");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void rejectsMalformedToken() {
        assertThat(jwtService.isTokenValid("not-a-token")).isFalse();
    }
}
