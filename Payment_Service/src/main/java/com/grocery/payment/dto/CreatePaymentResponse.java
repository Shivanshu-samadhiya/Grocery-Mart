package com.grocery.payment.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentResponse {

    private Long paymentId;

    private String razorpayOrderId;

    private BigDecimal amount;

    private String currency;

    private String status;
}