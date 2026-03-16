package com.bootcamp.ecommerce.inventory.dto.response;

import com.bootcamp.ecommerce.inventory.domain.model.Inventory;

import java.time.LocalDateTime;

public record InventoryResponse(
        Long productId,
        String productSku,
        Integer currentStock,
        LocalDateTime lastUpdated
) {
    public static InventoryResponse fromEntity(Inventory inventory) {
        return new InventoryResponse(
                inventory.getProduct().getId(),
                inventory.getProduct().getSku(),
                inventory.getStock(),
                inventory.getLastUpdated()
        );
    }
}
