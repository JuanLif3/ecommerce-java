package com.bootcamp.ecommerce.payment.controller;

import com.bootcamp.ecommerce.payment.dto.request.PaymentWebhookRequest;
import com.bootcamp.ecommerce.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Este es nuestro "Teléfono Rojo". Escucha los avisos del banco.
    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(@Valid @RequestBody PaymentWebhookRequest request) {
        paymentService.processPaymentWebhook(request);

        // A los bancos (Webhooks) solo les importa que les respondamos un "200 OK"
        // para saber que recibimos el mensaje. No necesitan un JSON complejo de vuelta.
        return ResponseEntity.ok("Webhook procesado correctamente");
    }
}
