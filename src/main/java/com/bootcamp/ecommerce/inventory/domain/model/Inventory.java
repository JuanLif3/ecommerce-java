package com.bootcamp.ecommerce.inventory.domain.model;

import com.bootcamp.ecommerce.catalog.domain.model.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Regla: El stock no puede ser nulo.
    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    // RELACIÓN UNO A UNO: Este registro de inventario le pertenece a un solo producto.
    // unique = true evita que un mismo producto tenga dos registros de inventario distintos.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;
}
