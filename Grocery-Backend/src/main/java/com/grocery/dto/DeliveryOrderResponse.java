package com.grocery.dto;

import java.time.LocalDateTime;

import com.grocery.enums.OrderStatus;
import com.grocery.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * What a delivery partner is allowed to see about an order: no product
 * line items, no other customers' data - just what's needed to make the
 * delivery.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrderResponse {

    private Long orderId;

    private String customerName;

    private String customerPhone;

    private String deliveryAddress;

    private Double amount;

    private PaymentStatus paymentStatus;

    private OrderStatus status;

    private LocalDateTime orderDate;
}
