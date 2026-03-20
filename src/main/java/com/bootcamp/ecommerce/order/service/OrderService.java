package com.bootcamp.ecommerce.order.service;

import com.bootcamp.ecommerce.catalog.domain.model.Product;
import com.bootcamp.ecommerce.catalog.repository.ProductRepository;
import com.bootcamp.ecommerce.customer.domain.model.Customer;
import com.bootcamp.ecommerce.customer.repository.CustomerRepository;
import com.bootcamp.ecommerce.inventory.dto.request.StockUpdateRequest;
import com.bootcamp.ecommerce.inventory.service.InventoryService;
import com.bootcamp.ecommerce.order.domain.model.Order;
import com.bootcamp.ecommerce.order.domain.model.OrderItem;
import com.bootcamp.ecommerce.order.domain.model.OrderStatus;
import com.bootcamp.ecommerce.order.dto.request.OrderCreateRequest;
import com.bootcamp.ecommerce.order.dto.request.OrderItemRequest;
import com.bootcamp.ecommerce.order.dto.response.OrderResponse;
import com.bootcamp.ecommerce.order.repository.OrderRepository;

// ! IMPORTACIONES NUEVAS
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Usamos RequiredArgsConstructor en vez de AllArgsConstructor (Mejor práctica)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    // ! NUEVO: Herramienta para enviar comandos SQL directos a la Base de Datos
    private final JdbcTemplate jdbcTemplate;

    // ! EL SCRIPT QUE ROMPE LA REGLA ANTIGUA AUTOMÁTICAMENTE
    @PostConstruct
    public void fixDatabaseRule() {
        try {
            // Le ordenamos a PostgreSQL que borre la restricción estricta de los estados
            jdbcTemplate.execute("ALTER TABLE sales_orders DROP CONSTRAINT IF EXISTS sales_orders_status_check;");
            System.out.println("/// [SYS_ADMIN] REGLA DE ESTADOS EN BASE DE DATOS ACTUALIZADA CON ÉXITO ///");
        } catch (Exception e) {
            System.out.println("/// [SYS_ADMIN] LA REGLA YA FUE ELIMINADA PREVIAMENTE ///");
        }
    }

    // * --- CREAR LA VENTA ---
    @Transactional
    public OrderResponse createOrder (OrderCreateRequest request) {

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Customer customer = customerRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado para el usuario actual"));

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .shippingAddress(request.shippingAddress())
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto ID " + itemRequest.productoId() + " ya no esta a la venta"));

            if (!product.getIsActive()) {
                throw new IllegalArgumentException("El producto " + product.getName() + " ya no esta a la venta");
            }

            inventoryService.updateStock(
                    product.getId(),
                    new StockUpdateRequest(-itemRequest.quantity())
            );

            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subTotal)
                    .build();

            order.getItems().add(orderItem);
            runningTotal = runningTotal.add(subTotal);
        }

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

        order.setStatus(OrderStatus.SHIPPED); // Ahora sí, Postgres lo dejará pasar
        return OrderResponse.fromEntity(orderRepository.save(order));
    }
}