package com.grocery.service;

import java.util.List;

import com.grocery.dto.OrderResponse;
import com.grocery.dto.PlaceOrderRequest;
import com.grocery.dto.UpdateOrderStatusRequest;
import com.grocery.dto.UpdatePaymentStatusRequest;

public interface OrderService {

	// Place a new order
    OrderResponse placeOrder(PlaceOrderRequest request);

    // Get order by ID
    OrderResponse getOrderById(Long orderId);

    // Get all orders of the logged-in user
    List<OrderResponse> getMyOrders();

    // Update order status
    OrderResponse updateOrderStatus(Long orderId,
                                    UpdateOrderStatusRequest request);

    // Cancel an order and restore stock for its items
    OrderResponse cancelOrder(Long orderId);
    
    
    // GET all the Orders
    List<OrderResponse> getAllOrders();
    
    
    // update the payment status
    OrderResponse updatePaymentStatus(UpdatePaymentStatusRequest request);

    // Orders that contain at least one product belonging to the
    // logged-in supplier, with items filtered to just their own products
    List<OrderResponse> getSupplierOrders();
}
