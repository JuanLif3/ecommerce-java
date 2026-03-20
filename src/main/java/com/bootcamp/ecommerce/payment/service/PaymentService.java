package com.bootcamp.ecommerce.payment.service;

import cl.transbank.common.IntegrationApiKeys;
import cl.transbank.common.IntegrationCommerceCodes;
import cl.transbank.common.IntegrationType;
import cl.transbank.webpay.common.WebpayOptions;
import cl.transbank.webpay.webpayplus.WebpayPlus;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCommitResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCreateResponse;
import com.bootcamp.ecommerce.order.domain.model.Order;
import com.bootcamp.ecommerce.order.domain.model.OrderStatus;
import com.bootcamp.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;

    // Inicializamos Transbank en modo INTEGRACIÓN (Pruebas)
    private final WebpayPlus.Transaction tx = new WebpayPlus.Transaction(
            new WebpayOptions(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, IntegrationType.TEST)
    );

    // 1. Crear la transacción y enviarla a Transbank
    public Map<String, String> initTransaction(Long orderId, String returnUrl) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));

        String buyOrder = "ORDEN-" + order.getId();
        // CORRECCIÓN: Usamos el ID de la orden para la sesión, así evitamos el error del Customer
        String sessionId = "SESSION-" + order.getId();
        double amount = order.getTotalAmount().doubleValue(); // Debe ser double para TBK

        // Llamada a Transbank
        WebpayPlusTransactionCreateResponse response = tx.create(buyOrder, sessionId, amount, returnUrl);

        // Guardamos el token en la orden
        order.setTransbankToken(response.getToken());
        orderRepository.save(order);

        // Devolvemos la URL y el Token a React
        Map<String, String> result = new HashMap<>();
        result.put("url", response.getUrl());
        result.put("token", response.getToken());
        return result;
    }

    // 2. Confirmar el pago cuando el usuario vuelve de Transbank
    public Order confirmPayment(String tokenWs) throws Exception {
        // Confirmamos en Transbank
        WebpayPlusTransactionCommitResponse response = tx.commit(tokenWs);

        // Buscamos la orden por el token
        Order order = orderRepository.findByTransbankToken(tokenWs)
                .orElseThrow(() -> new IllegalArgumentException("Orden inválida"));

        // Validamos si el pago fue exitoso (ResponseCode 0 = Aprobado)
        if (response.getResponseCode() == 0) {
            order.setStatus(OrderStatus.PAID); // Cambia el estado a PAGADO
        } else {
            order.setStatus(OrderStatus.CANCELLED);
        }

        return orderRepository.save(order);
    }
}