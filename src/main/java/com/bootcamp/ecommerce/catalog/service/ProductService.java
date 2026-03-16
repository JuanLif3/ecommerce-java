package com.bootcamp.ecommerce.catalog.service;

import com.bootcamp.ecommerce.catalog.domain.model.Category;
import com.bootcamp.ecommerce.catalog.domain.model.Product;
import com.bootcamp.ecommerce.catalog.dto.request.ProductCreateRequest;
import com.bootcamp.ecommerce.catalog.dto.response.ProductResponse;
import com.bootcamp.ecommerce.catalog.repository.CategoryRepository;
import com.bootcamp.ecommerce.catalog.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {

        if(productRepository.findBySku(request.sku()).isPresent()) {
            throw  new IllegalArgumentException("Ya existe un producto con SKU: " + request.sku());
        }

        Category category = categoryRepository.findByIdAndIsActiveTrue(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria no encontrada o inactiva"));

        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .category(category)
                .build();

        Product saveProduct = productRepository.save(product);

        return ProductResponse.fromEntity(saveProduct);
    }
}
