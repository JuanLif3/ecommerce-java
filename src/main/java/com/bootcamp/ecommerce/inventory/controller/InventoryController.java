package com.bootcamp.ecommerce.inventory.controller;

import com.bootcamp.ecommerce.inventory.dto.request.StockUpdateRequest;
import com.bootcamp.ecommerce.inventory.dto.response.InventoryResponse;
import com.bootcamp.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/{productId}")
    public ResponseEntity<InventoryResponse> initialize(@PathVariable Long productId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.initializeInventory(productId));
    }

    @PutMapping("/{productId}/stock")
    public ResponseEntity<InventoryResponse> updateStock(@PathVariable Long productId, @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, request));
    }
}
