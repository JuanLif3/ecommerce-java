package com.bootcamp.ecommerce.inventory.service;

import com.bootcamp.ecommerce.catalog.domain.model.Product;
import com.bootcamp.ecommerce.catalog.repository.ProductRepository;
import com.bootcamp.ecommerce.inventory.domain.model.Inventory;
import com.bootcamp.ecommerce.inventory.dto.request.StockUpdateRequest;
import com.bootcamp.ecommerce.inventory.dto.response.InventoryResponse;
import com.bootcamp.ecommerce.inventory.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    // * Crear el inventario inicial en CERO cuando se lanza un nuevo producto
    @Transactional
    public InventoryResponse initializeInventory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if(inventoryRepository.findByProductId(productId).isPresent()) {
            throw new IllegalArgumentException("El producto ya tiene un registro");
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .stock(0)
                .lastUpdated(LocalDateTime.now())
                .build();

        return InventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    // * Sumar o restar stock (El metodo critico que usara el carrito de compras)
    @Transactional
    public InventoryResponse updateStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("No hay inventario para este producto"));

        // Logica suma / resta
        int currentSotck = inventory.getStock();
        int newStock = currentSotck + request.quantity();

        // La base de datos nunca puede quedar con stock negativo.
        // Nuestra Red de Seguridad global (GlobalExceptionHandler) atrapará este error.
        if (newStock < 0) {
            throw new IllegalArgumentException("Operacion ivnalida: Stock insuficiente");
        }

        inventory.setStock(newStock);
        inventory.setLastUpdated(LocalDateTime.now());

        return InventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }
}
