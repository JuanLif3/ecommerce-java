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
import java.util.List;
import java.util.stream.Collectors;

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
                .imageUrl(request.imageUrl())
                .build();

        Product saveProduct = productRepository.save(product);

        return ProductResponse.fromEntity(saveProduct);
    }

    public List<ProductResponse> getAllProducts() {
        // Buscamos todos los productos en la base de datos
        return productRepository.findAll()
                .stream() // Abrimos una cinta transportadora (Stream)
                .map(ProductResponse::fromEntity) // Transformamos cada entidad Product a un DTO ProductResponse
                .collect(Collectors.toList()); // Los empaquetamos todos de vuelta en una Lista
    }
}
