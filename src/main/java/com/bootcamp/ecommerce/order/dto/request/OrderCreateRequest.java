package com.bootcamp.ecommerce.order.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OrderCreateRequest(

        @NotEmpty(message = "La orden debe tener al menos un producto")
        List<OrderItemRequest> items,
        String shippingAddress
) {
}
