package com.bootcamp.ecommerce.catalog.dto.response;

import com.bootcamp.ecommerce.catalog.domain.model.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        BigDecimal price,
        String categoryName,
        String imageUrl
) {

    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getPrice(),
                product.getCategory() != null ? product.getCategory().getName() : "Sin Categoría",
                product.getImageUrl()
        );
    }
}
