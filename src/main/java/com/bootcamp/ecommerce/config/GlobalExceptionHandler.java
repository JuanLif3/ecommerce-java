package com.bootcamp.ecommerce.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

// * @RestControllerAdvice convierte a esta clase en un oyente global.
// * Si CUALQUIER controlador lanza un error, esta clase lo atrapa en el aire.
@RestControllerAdvice
public class GlobalExceptionHandler {

    // * --- ATRAPAR REGLAS DE NEGOCIO ---
    // * Ejemplo: "No hay stock", "El email ya existe", "La orden está cancelada".
    @ExceptionHandler(IllegalAccessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRules (IllegalAccessException ex) {

        // Envolvemos el mensaje del throw en nuestro ErrorResponse DTO
        ErrorResponse error = ErrorResponse.of(ex.getMessage(), HttpStatus.BAD_REQUEST.value());

        // Devolvemos un 400 Bad Request, que le dice a React: "Oye, te equivocaste en tu petición"
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // * --- ATRAPAR ERRORES DE VALIDACION DEL JSON (@NotBlank, @Email, @Positive) ---
    // * Cuando el Request DTO falla, Spring lanza un MethodArgumentNotValidException.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {

        // Spring nos da una lista de todos los campos que fallaron.
        // Fíjate cómo usamos .stream() para extraer solo los mensajes (ej: "El nombre es obligatorio")
        // y los unimos todos separados por comas.
        String errorMessages = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse error = ErrorResponse.of(errorMessages, HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // * --- ATRAPAR ERRORES INTERNOS (Cualquier otra cosa que no hayamos previsto) ---
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericErrors(Exception ex) {
        // Aquí no le pasamos el 'ex.getMessage()' al usuario porque podría contener código SQL.
        // Le damos un mensaje genérico y limpio.
        ErrorResponse error = ErrorResponse.of("Error interno del servidor. Contacte a soporte.", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
