package com.bootcamp.ecommerce.catalog.repository;

import com.bootcamp.ecommerce.catalog.domain.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // * Validacion para que no se creen dos productos con el mismo codigo de barras
    Optional<Product> findBySku(String sku);
}
