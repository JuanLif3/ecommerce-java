package com.bootcamp.ecommerce.catalog.service;

import com.bootcamp.ecommerce.catalog.domain.model.Category;
import com.bootcamp.ecommerce.catalog.domain.model.Product;
import com.bootcamp.ecommerce.catalog.dto.request.ProductCreateRequest;
import com.bootcamp.ecommerce.catalog.dto.request.ProductUpdateRequest;
import com.bootcamp.ecommerce.catalog.dto.response.ProductResponse;
import com.bootcamp.ecommerce.catalog.repository.CategoryRepository;
import com.bootcamp.ecommerce.catalog.repository.ProductRepository;

// IMPORTANTE: Importamos las clases de inventario
import com.bootcamp.ecommerce.inventory.domain.model.Inventory;
import com.bootcamp.ecommerce.inventory.repository.InventoryRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository; // <-- NUEVO: Inyectamos el repo de Inventario

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {

        if(productRepository.findBySku(request.sku()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un producto con SKU: " + request.sku());
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
                .imageUrls(request.imageUrls() != null ? request.imageUrls() : new ArrayList<>())
                .build();

        Product saveProduct = productRepository.save(product);

        // ! --- MAGIA AQUÍ ---
        // Al crear el producto, le fabricamos su registro de inventario con 100 unidades de regalo.
        Inventory inventory = Inventory.builder()
                .product(saveProduct)
                .stock(100) // Stock inicial para que podamos comprarlo en las pruebas
                .lastUpdated(LocalDateTime.now())
                .build();
        inventoryRepository.save(inventory);

        return ProductResponse.fromEntity(saveProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // * Método para actualizar el producto
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado. ID: " + id));

        Category category = categoryRepository.findByIdAndIsActiveTrue(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada o inactiva"));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(category);

        // Solo actualizamos la imagen si viene una nueva en el request
        if(request.imageUrls() != null && !request.imageUrls().isEmpty()) {
            product.setImageUrls(request.imageUrls());
        }

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    // * Método para desactivar (borrado lógico)
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado. ID: " + id));

        product.setIsActive(false);
        productRepository.save(product);
    }
}