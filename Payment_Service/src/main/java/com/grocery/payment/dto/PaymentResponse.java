package com.grocery.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.grocery.payment.entity.PaymentMethod;
import com.grocery.payment.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long orderId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private BigDecimal amount;

    private String currency;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;
}