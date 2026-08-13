package com.grocery.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.dto.OrderResponse;
import com.grocery.dto.PlaceOrderRequest;
import com.grocery.dto.UpdateOrderStatusRequest;
import com.grocery.dto.UpdatePaymentStatusRequest;
import com.grocery.service.OrderService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")

public class OrderController {

	
    private final OrderService orderService;

    
    /**
     * Place a new order
     */
    @PreAuthorize("hasRole('USER')")

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request) {

        OrderResponse response = orderService.placeOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Get order by ID
     */
    @PreAuthorize("hasRole('USER')")

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId));
    }

    /**
     * 
     * Get all orders placed by the logged-in user
     */
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {

        return ResponseEntity.ok(
                orderService.getMyOrders());
    }

    
    
    
    
    /**
     * Update order status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(orderId, request));
    }

    
    // GET all the ORDER 
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    /**
     * Cancel an order. Restores stock for every item in the order.
     */
    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.cancelOrder(orderId));
    }
    
    // update payment status
    
    @PutMapping("/payment-status")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @Valid @RequestBody UpdatePaymentStatusRequest request) {

        return ResponseEntity.ok(
                orderService.updatePaymentStatus(request));
    }

    /**
     * Orders that contain at least one product belonging to the
     * logged-in supplier. Each order's items are limited to just
     * that supplier's own products.
     */
    @PreAuthorize("hasRole('SUPPLIER')")
    @GetMapping("/supplier-orders")
    public ResponseEntity<List<OrderResponse>> getSupplierOrders() {

        return ResponseEntity.ok(orderService.getSupplierOrders());
    }

}
