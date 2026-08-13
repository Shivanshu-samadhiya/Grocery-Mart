package com.grocery.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.grocery.payment.dto.CreatePaymentRequest;
import com.grocery.payment.dto.CreatePaymentResponse;

@FeignClient(
        name = "payment-service",
        url = "${payment.service.url}"
)
public interface PaymentClient {

	
	 @PostMapping("/api/payments/create")
	    CreatePaymentResponse createPayment(
	            @RequestBody CreatePaymentRequest request);

}
