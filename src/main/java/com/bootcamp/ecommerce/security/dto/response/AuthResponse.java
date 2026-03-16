package com.bootcamp.ecommerce.security.dto.response;

public record AuthResponse(
        String token,
        String email,
        String role
) {
}
