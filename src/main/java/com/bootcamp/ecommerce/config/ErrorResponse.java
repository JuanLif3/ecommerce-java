package com.bootcamp.ecommerce.config;

import java.time.LocalDateTime;

// * Este es el "Traje de Gala" pero para los errores.
// * Todos los errores que devolvamos a React tendrán esta misma estructura exacta.
public record ErrorResponse(
        String message,
        int status,
        LocalDateTime timestamp
) {

    public static ErrorResponse of(String message, int status) {
        return new ErrorResponse(
                message,
                status,
                LocalDateTime.now()
        );
    }
}
