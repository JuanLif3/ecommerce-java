package com.bootcamp.ecommerce.payment.controller;

import com.bootcamp.ecommerce.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/init/{orderId}")
    public ResponseEntity<Map<String, String>> initPayment(@PathVariable Long orderId) {
        try {
            // URL a la que volverá Transbank después de pagar
            String returnUrl = "http://localhost:5173/payment/commit";
            return ResponseEntity.ok(paymentService.initTransaction(orderId, returnUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/commit")
    public ResponseEntity<?> commitPayment(@RequestParam("token_ws") String tokenWs) {
        try {
            // Confirmamos en la base de datos y Transbank
            paymentService.confirmPayment(tokenWs);
            return ResponseEntity.ok().build(); // Devuelve 200 OK si todo sale bien
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al confirmar el pago");
        }
    }
}