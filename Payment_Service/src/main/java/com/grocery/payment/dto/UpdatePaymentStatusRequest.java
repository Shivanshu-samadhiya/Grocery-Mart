package com.grocery.payment.dto;

import com.grocery.payment.entity.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePaymentStatusRequest {

	   private Long orderId;

	    private PaymentStatus paymentStatus;
}
