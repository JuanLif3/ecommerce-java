package com.bootcamp.ecommerce.customer.dto.request;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerCreateRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        String lastName,

        // * La Red de Seguridad verificará que el texto tenga un '@'
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Formato de email invalido")
        String email,

        String phone,

        // Datos de la dirección
        @NotBlank(message = "La calle es obligatoria")
        String street,

        @NotBlank(message = "La ciudad es obligatoria")
        String city,

        @NotBlank(message = "El código postal es obligatorio")
        String zipCode
) {
}
