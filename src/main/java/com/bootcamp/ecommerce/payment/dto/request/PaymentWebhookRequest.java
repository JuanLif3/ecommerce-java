package com.bootcamp.ecommerce.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PaymentWebhookRequest(
        @NotNull(message = "El ID de la orden es obligatorio")
        Long orderId,

        @NotBlank(message = "El estado del apgo es obligatorio")
        String paymentStatus
) {
}
