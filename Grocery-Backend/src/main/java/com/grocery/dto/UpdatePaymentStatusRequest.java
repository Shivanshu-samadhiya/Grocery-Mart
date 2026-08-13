package com.grocery.dto;

import com.grocery.enums.PaymentStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UpdatePaymentStatusRequest {

	
	 @NotNull(message = "Order ID is required")
	    private Long orderId;

	 @NotNull(message = "Payment Status is required")
	    private PaymentStatus paymentStatus;
}
