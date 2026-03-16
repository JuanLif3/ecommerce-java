package com.bootcamp.ecommerce.catalog.repository;

import com.bootcamp.ecommerce.catalog.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Necesitamos buscar por nombre para evitar que el usuario intente crear "Electrónica" dos veces.
    Optional<Category> findByName(String name);

    // Buscar la categoría solo si está activa (para no asignarle productos a una categoría borrada lógicamente).
    Optional<Category> findByIdAndIsActiveTrue(Long id);
}
