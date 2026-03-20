package com.bootcamp.ecommerce.catalog.dto.request;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpdateRequest(
        String name,
        String description,
        BigDecimal price,
        Long categoryId,
        List<String> imageUrls
) {}