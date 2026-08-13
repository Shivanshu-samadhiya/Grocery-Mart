package com.grocery.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.grocery.payment.dto.UpdatePaymentStatusRequest;


@FeignClient(
        name = "order-service",
        url = "http://localhost:8080")
public interface OrderClient {

	
	  @PutMapping("/api/orders/payment-status")
	    void updatePaymentStatus(
	            @RequestBody UpdatePaymentStatusRequest request);
}
