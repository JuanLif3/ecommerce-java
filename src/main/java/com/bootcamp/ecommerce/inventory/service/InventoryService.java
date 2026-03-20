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

    @Transactional
    public InventoryResponse initializeInventory(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if(inventoryRepository.findByProductId(productId).isPresent()) {
            throw new IllegalArgumentException("El producto ya tiene un registro");
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .stock(100)
                .lastUpdated(LocalDateTime.now())
                .build();

        return InventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }

    // * Sumar o restar stock (El método crítico que usará el carrito de compras)
    @Transactional
    public InventoryResponse updateStock(Long productId, StockUpdateRequest request) {

        // ! MAGIA A PRUEBA DE BALAS:
        // Si el inventario no existe (porque el producto es viejo), lo creamos sobre la marcha con 100 unidades
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> {
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

                    Inventory newInventory = Inventory.builder()
                            .product(product)
                            .stock(100) // Le regalamos 100 de stock inicial
                            .lastUpdated(LocalDateTime.now())
                            .build();

                    return inventoryRepository.save(newInventory);
                });

        // Lógica suma / resta
        int currentStock = inventory.getStock();
        int newStock = currentStock + request.quantity(); // quantity viene negativo desde el carrito (-1, -2, etc)

        // La base de datos nunca puede quedar con stock negativo.
        if (newStock < 0) {
            throw new IllegalArgumentException("Operación inválida: Stock insuficiente");
        }

        inventory.setStock(newStock);
        inventory.setLastUpdated(LocalDateTime.now());

        return InventoryResponse.fromEntity(inventoryRepository.save(inventory));
    }
}