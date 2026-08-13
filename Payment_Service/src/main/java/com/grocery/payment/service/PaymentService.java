package com.grocery.payment.service;

import java.util.List;

import com.grocery.payment.dto.CreatePaymentRequest;
import com.grocery.payment.dto.CreatePaymentResponse;
import com.grocery.payment.dto.PaymentResponse;
import com.grocery.payment.dto.VerifyPaymentRequest;
import com.grocery.payment.dto.WebhookEvent;
import com.grocery.payment.entity.PaymentStatus;

public interface PaymentService {

    CreatePaymentResponse createPayment(CreatePaymentRequest request) throws Exception;

    String verifyPayment(VerifyPaymentRequest request) throws Exception;
    PaymentResponse getPaymentById(Long paymentId);
    PaymentResponse getPaymentByOrderId(Long orderId);
    void processWebhook(WebhookEvent webhookEvent, String signature);
    List<PaymentResponse> getAllPayments();

    List<PaymentResponse> getPaymentsByStatus(PaymentStatus status);
}