package com.bootcamp.ecommerce.catalog.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SKU (Stock Keeping Unit): Es el código de barras único del producto (Ej: IPH-15-PRO-256)
    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String description;

    // Usamos BigDecimal para dinero, NUNCA uses Double o Float porque pierden centavos en cálculos.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // * --- RELACION: MUCHOS PRODUCTOS PERTENECEN A UNA SOLA CATEGORIA ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "image_url")
    private String imageUrl;
}
