package com.bootcamp.ecommerce.order.dto.response;

import com.bootcamp.ecommerce.order.domain.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        String customerName,
        String customerEmail,
        String customerPhone,
        String shippingAddress,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse fromEntity(Order order) {
        return  new OrderResponse(
                order.getId(),
                order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName(),
                order.getCustomer().getEmail(),
                order.getCustomer().getPhone(), // Extraemos el teléfono del cliente
                order.getShippingAddress(), // Extraemos la dirección del pedido
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getItems().stream().map(OrderItemResponse::fromEntity).toList()
        );
    }
}
