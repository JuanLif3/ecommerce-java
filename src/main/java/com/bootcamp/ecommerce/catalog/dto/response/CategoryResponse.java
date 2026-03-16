package com.bootcamp.ecommerce.catalog.dto.response;

import com.bootcamp.ecommerce.catalog.domain.model.Category;

public record CategoryResponse(
        Long id,
        String name,
        String description
) {
    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }
}
