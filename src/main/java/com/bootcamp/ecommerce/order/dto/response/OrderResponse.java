package com.bootcamp.ecommerce.order.dto.response;

import com.bootcamp.ecommerce.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        String customerName,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse fromEntity(Order order) {
        return  new OrderResponse(
                order.getId(),
                order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                // Transformamos la lista de Entidades a lista de DTOs
                order.getItems().stream().map(OrderItemResponse::fromEntity).toList()
        );
    }
}
