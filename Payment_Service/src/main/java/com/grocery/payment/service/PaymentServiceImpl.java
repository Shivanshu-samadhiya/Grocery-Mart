package com.grocery.payment.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.grocery.payment.client.OrderClient;
import com.grocery.payment.dto.CreatePaymentRequest;
import com.grocery.payment.dto.CreatePaymentResponse;
import com.grocery.payment.dto.PaymentResponse;
import com.grocery.payment.dto.UpdatePaymentStatusRequest;
import com.grocery.payment.dto.VerifyPaymentRequest;
import com.grocery.payment.dto.WebhookEvent;
import com.grocery.payment.entity.Payment;
import com.grocery.payment.entity.PaymentMethod;
import com.grocery.payment.entity.PaymentStatus;
import com.grocery.payment.exception.InvalidPaymentException;
import com.grocery.payment.exception.ResourceNotFoundException;
import com.grocery.payment.repository.PaymentRepository;
import com.grocery.payment.util.SignatureVerifier;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

	
	private final OrderClient orderClient;
	
    private static final Logger logger =
            LoggerFactory.getLogger(PaymentServiceImpl.class);

    
    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final SignatureVerifier signatureVerifier;

    @Override
    public CreatePaymentResponse createPayment(CreatePaymentRequest request) throws Exception {

        logger.info("Creating payment for Order ID: {}", request.getOrderId());

        try {

            // Convert amount to paise
            int amountInPaise = request.getAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .intValue();

            // Create Razorpay Order
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "ORDER_" + request.getOrderId());

            Order razorpayOrder = razorpayClient.orders.create(options);

            String razorpayOrderId = razorpayOrder.get("id").toString();

            logger.info("Razorpay Order Created Successfully. Razorpay Order ID: {}",
                    razorpayOrderId);

            // Save Payment
            Payment payment = Payment.builder()
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .currency("INR")
                    .status(PaymentStatus.PENDING)
                    .paymentMethod(null)
                    .razorpayOrderId(razorpayOrder.get("id").toString())
                    .build();

            payment = paymentRepository.save(payment);

            logger.info("Payment Saved Successfully. Payment ID: {}",
                    payment.getId());

            return CreatePaymentResponse.builder()
                    .paymentId(payment.getId())
                    .razorpayOrderId(payment.getRazorpayOrderId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(payment.getStatus().name())
                    .build();

        } catch (Exception ex) {

            logger.error("Error while creating payment for Order ID: {}",
                    request.getOrderId(), ex);

            throw ex;
        }
    }

    @Override
    public String verifyPayment(VerifyPaymentRequest request) throws Exception {

        logger.info("Verifying Payment. Razorpay Order ID: {}",
                request.getRazorpayOrderId());

        try {

            Payment payment = paymentRepository
                    .findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Payment Not Found"));

            logger.info("Payment Found. Payment ID: {}", payment.getId());

            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());

            // Temporary for demo
            payment.setPaymentMethod(PaymentMethod.UPI);

            boolean isValid = signatureVerifier.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature());

            if (!isValid) {

                logger.warn("Invalid Razorpay Signature for Order ID: {}",
                        request.getRazorpayOrderId());

                payment.setStatus(PaymentStatus.FAILED);

                paymentRepository.save(payment);
                
                
                UpdatePaymentStatusRequest paymentStatusRequest =
                        new UpdatePaymentStatusRequest();

                paymentStatusRequest.setOrderId(payment.getOrderId());

                paymentStatusRequest.setPaymentStatus(payment.getStatus());

                orderClient.updatePaymentStatus(paymentStatusRequest);

                throw new InvalidPaymentException("Invalid Razorpay Signature");
            }

            payment.setStatus(PaymentStatus.SUCCESS);
            
            payment.setPaidAt(LocalDateTime.now());

            paymentRepository.save(payment);

            logger.info("Payment Verified Successfully. Payment ID: {}",
                    payment.getId());

            return "Payment Verified Successfully";

        } catch (Exception ex) {

            logger.error("Payment Verification Failed. Razorpay Order ID: {}",
                    request.getRazorpayOrderId(), ex);

            throw ex;
        }
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {

        logger.info("Fetching Payment By ID: {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment Not Found"));

        logger.info("Payment Found. Payment ID: {}", payment.getId());

        return mapToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {

        logger.info("Fetching Payment By Order ID: {}", orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment Not Found"));

        logger.info("Payment Found For Order ID: {}", orderId);

        return mapToResponse(payment);
    }

    @Override
    public void processWebhook(WebhookEvent webhookEvent, String signature) {

        logger.info("Webhook Received");

        String event = webhookEvent.getEvent();

        logger.info("Event : {}", event);

        if ("payment.captured".equals(event)) {

            String paymentId = webhookEvent.getPayload()
                    .path("payment")
                    .path("entity")
                    .path("id")
                    .asText();

            String orderId = webhookEvent.getPayload()
                    .path("payment")
                    .path("entity")
                    .path("order_id")
                    .asText();

            logger.info("Payment ID : {}", paymentId);
            logger.info("Order ID : {}", orderId);

            Payment payment = paymentRepository
                    .findByRazorpayOrderId(orderId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Payment Not Found"));

            payment.setRazorpayPaymentId(paymentId);
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            paymentRepository.save(payment);

            logger.info("Payment Updated Successfully");
        }

    }
    @Override
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {

        return paymentRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    private PaymentResponse mapToResponse(Payment payment) {
        // NOTE: previously this method silently flipped any PENDING payment to
        // SUCCESS just because it was read. That meant a payment could be
        // reported (and persisted) as paid without ever being verified.
        // We now report the payment's real, persisted status.
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}