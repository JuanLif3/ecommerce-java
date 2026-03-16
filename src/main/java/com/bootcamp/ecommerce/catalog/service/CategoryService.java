package com.bootcamp.ecommerce.catalog.service;

import com.bootcamp.ecommerce.catalog.domain.model.Category;
import com.bootcamp.ecommerce.catalog.dto.request.CategoryCreateRequest;
import com.bootcamp.ecommerce.catalog.dto.response.CategoryResponse;
import com.bootcamp.ecommerce.catalog.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {

        // REGLA DE NEGOCIO: Evitar nombres duplicados.
        // Si el .isPresent() da true, hacemos un throw.
        // GRACIAS AL GLOBAL EXCEPTION HANDLER que hicimos en la fase 1, este throw se transformará automáticamente en un JSON bonito con status 400.
        if(categoryRepository.findByName(request.name()).isPresent()) {
            throw new IllegalArgumentException("Ya existe una categoria con el nombre");
        }

        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .createdAt(LocalDateTime.now())
                .build();

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::getIsActive) // Filtramos en memoria para solo mostrar las activas
                .map(CategoryResponse::fromEntity)
                .toList();
    }
}
