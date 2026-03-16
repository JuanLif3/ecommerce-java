package com.bootcamp.ecommerce.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotBlank(message = "El nombre de la categoria es obligatoria")
        @Size(max = 50, message = "El nombre no puede exceder los 50 caracteres")
        String name,

        String description
) {
}
