package com.grocery.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.grocery.enums.OrderStatus;
import com.grocery.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

	 private Long orderId;

	    private Long userId;

	    private String deliveryAddress;

	    private OrderStatus status;

	    private LocalDateTime orderDate;

	    private Double totalAmount;

	    private List<OrderItemResponse> items;
	    
	    
	    private Long paymentId;

	    private String razorpayOrderId;

	    private PaymentStatus paymentStatus;
}


