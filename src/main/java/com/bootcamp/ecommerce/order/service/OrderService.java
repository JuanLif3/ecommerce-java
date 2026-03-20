package com.bootcamp.ecommerce.order.service;

import com.bootcamp.ecommerce.catalog.domain.model.Product;
import com.bootcamp.ecommerce.catalog.repository.ProductRepository;
import com.bootcamp.ecommerce.customer.domain.model.Customer;
import com.bootcamp.ecommerce.customer.repository.CustomerRepository;
import com.bootcamp.ecommerce.inventory.dto.request.StockUpdateRequest;
import com.bootcamp.ecommerce.inventory.repository.InventoryRepository;
import com.bootcamp.ecommerce.inventory.service.InventoryService;
import com.bootcamp.ecommerce.order.domain.model.Order;
import com.bootcamp.ecommerce.order.domain.model.OrderItem;
import com.bootcamp.ecommerce.order.domain.model.OrderStatus;
import com.bootcamp.ecommerce.order.dto.request.OrderCreateRequest;
import com.bootcamp.ecommerce.order.dto.request.OrderItemRequest;
import com.bootcamp.ecommerce.order.dto.response.OrderResponse;
import com.bootcamp.ecommerce.order.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    // * --- CREAR LA VENTA ---
    @Transactional
    public OrderResponse createOrder (OrderCreateRequest request) {

        // ! Sacamos el email directamente de la Pulsera VIP (Token JWT)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        // ! Buscamos al cliente usando ese email seguro
        Customer customer = customerRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado para el usuario actual"));

        // ! Crear la boleta inicial en blanco
        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO) // Empezamos en cero
                .createdAt(LocalDateTime.now())
                .shippingAddress(request.shippingAddress())
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        // ! Procesar el carrito (Bucle por cada producto que viene en el JSON)
        for (OrderItemRequest itemRequest : request.items()) {

            // ! Buscar el producto apra saber su precio real
            Product product = productRepository.findById(itemRequest.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto ID " + itemRequest.productoId() + " ya no esta a la venta"));

            if (!product.getIsActive()) {
                throw new IllegalArgumentException("El producto " + product.getName() + " ya no esta a la venta");
            }

            // ! Descontar el inventario
            inventoryService.updateStock(
                    product.getId(),
                    new StockUpdateRequest(-itemRequest.quantity())
            );

            // ! Calcular subtotal de esta linea (Precio * cantidad)
            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));

            // ! Ensamblar la linea de detaller
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subTotal)
                    .build();

            // ! Añadir la linea a la boleta y sumar el total general
            order.getItems().add(orderItem);
            runningTotal = runningTotal.add(subTotal);
        }

        // ! Finalizar la boleta
        order.setTotalAmount(runningTotal);

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.fromEntity(savedOrder);
    }

    // * OBTENER TODAS LAS ÓRDENES
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // * MÉTODO PARA EMPAQUETAR EL PEDIDO
    @Transactional
    public OrderResponse markOrderAsShipped(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));

        order.setStatus(OrderStatus.SHIPPED); // Cambiamos a enviado/empaquetado
        return OrderResponse.fromEntity(orderRepository.save(order));
    }
}
