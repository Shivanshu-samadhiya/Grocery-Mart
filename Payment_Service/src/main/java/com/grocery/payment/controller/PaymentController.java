package com.grocery.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.payment.dto.CreatePaymentRequest;
import com.grocery.payment.dto.CreatePaymentResponse;
import com.grocery.payment.dto.PaymentResponse;
import com.grocery.payment.dto.VerifyPaymentRequest;
import com.grocery.payment.dto.WebhookEvent;
import com.grocery.payment.entity.PaymentStatus;
import com.grocery.payment.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;	
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request) throws Exception {

        return ResponseEntity.ok(paymentService.createPayment(request));
    }
    
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody VerifyPaymentRequest request) throws Exception {

        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(orderId));
    }
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody WebhookEvent webhookEvent,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        paymentService.processWebhook(webhookEvent, signature);

        return ResponseEntity.ok("Webhook Received Successfully");
    }
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments());
    }
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(
            @PathVariable PaymentStatus status) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByStatus(status));
    }
}