package com.bootcamp.ecommerce.inventory.repository;

import com.bootcamp.ecommerce.inventory.domain.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Buscaremos el inventario usando el ID del producto al que pertenece
    Optional<Inventory> findByProductId(Long productId);
}
