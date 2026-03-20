package com.bootcamp.ecommerce.catalog.dto.response;

import com.bootcamp.ecommerce.catalog.domain.model.Product;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        BigDecimal price,
        String categoryName,
        List<String> imageUrls
) {

    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getPrice(),
                product.getCategory() != null ? product.getCategory().getName() : "Sin Categoría",
                product.getImageUrls() != null ? product.getImageUrls() : new ArrayList<>() // Llamamos a getImageUrls() (en plural)
        );
    }
}
