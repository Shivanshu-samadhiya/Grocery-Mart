package com.grocery.service;

import java.util.List;

import com.grocery.dto.DeliveryDashboardResponse;
import com.grocery.dto.DeliveryOrderResponse;

public interface DeliveryService {

    // Today's assigned / pending / completed / cancelled counts for the logged-in partner
    DeliveryDashboardResponse getDashboard();

    // Active (not yet delivered/cancelled) orders assigned to the logged-in partner
    List<DeliveryOrderResponse> getAssignedOrders();

    // ASSIGNED -> PICKED_UP
    DeliveryOrderResponse acceptOrder(Long orderId);

    // PICKED_UP -> OUT_FOR_DELIVERY
    DeliveryOrderResponse markOutForDelivery(Long orderId);

    // OUT_FOR_DELIVERY -> DELIVERED
    DeliveryOrderResponse markDelivered(Long orderId);

    // Past deliveries (DELIVERED / CANCELLED) for the logged-in partner
    List<DeliveryOrderResponse> getHistory();
}
