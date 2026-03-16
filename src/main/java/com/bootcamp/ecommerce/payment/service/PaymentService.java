package com.bootcamp.ecommerce.payment.service;

import com.bootcamp.ecommerce.order.domain.model.Order;
import com.bootcamp.ecommerce.order.domain.model.OrderStatus;
import com.bootcamp.ecommerce.order.repository.OrderRepository;
import com.bootcamp.ecommerce.payment.dto.request.PaymentWebhookRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;

    @Transactional
    public void processPaymentWebhook(PaymentWebhookRequest request) {

        // Buscamos la orden que Transbank nos dice que fue pagada
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));

        // Solo podemos pagar ordenes pendientes
        if(order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("La orden ya fue procesada o cancelada");
        }

        // Cambiamos el estado dependiendo de lo que diga el banco
        if ("SUCCESS".equalsIgnoreCase(request.paymentStatus())) {
            order.setStatus(OrderStatus.PAID);
            System.out.println("Orden completada: " + order.getId() + " pagada.");
        } else {
            order.setStatus(OrderStatus.CANCELLED);
            System.out.println("Pago rechazado: " +order.getId() + " marcada como cancelada");
        }

        orderRepository.save(order);
    }
}
