package com.bootcamp.ecommerce.inventory.dto.request;

import jakarta.validation.constraints.NotNull;

public record StockUpdateRequest(
        // Aquí no usamos @Positive porque a veces restaremos stock (ej: -2) cuando alguien compre.
        @NotNull(message = "La cantidad es obligatoria")
        Integer quantity
) {
}
