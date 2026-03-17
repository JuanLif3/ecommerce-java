package com.bootcamp.ecommerce.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProductCreateRequest(
        @NotBlank(message = "EL SKU es obligatorio")
        String sku,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        String description,

        // * El precio debe ser un número positivo, nadie puede crear productos gratis o a precio negativo.
        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor a 0")
        BigDecimal price,

        // * Necesitamos saber a qué categoría pertenece este producto
        @NotNull(message = "El ID de la categoría es obligatorio")
        Long categoryId,

        String imageUrl
) {
}
