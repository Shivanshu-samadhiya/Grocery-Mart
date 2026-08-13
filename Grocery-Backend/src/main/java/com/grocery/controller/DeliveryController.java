package com.grocery.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.dto.DeliveryDashboardResponse;
import com.grocery.dto.DeliveryOrderResponse;
import com.grocery.service.DeliveryService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

/**
 * Everything here is scoped to the logged-in delivery partner. A partner
 * can never see or act on another partner's orders - see
 * DeliveryServiceImpl#getOwnedOrder for the ownership check.
 */
@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('DELIVERY')")
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Today's Assigned / Pending / Completed / Cancelled counts.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DeliveryDashboardResponse> dashboard() {

        return ResponseEntity.ok(deliveryService.getDashboard());
    }

    /**
     * Orders assigned to the logged-in delivery partner (active only).
     */
    @GetMapping("/orders")
    public ResponseEntity<List<DeliveryOrderResponse>> getAssignedOrders() {

        return ResponseEntity.ok(deliveryService.getAssignedOrders());
    }

    /**
     * ASSIGNED -> PICKED_UP
     */
    @PutMapping("/orders/{id}/accept")
    public ResponseEntity<DeliveryOrderResponse> acceptOrder(@PathVariable Long id) {

        return ResponseEntity.ok(deliveryService.acceptOrder(id));
    }

    /**
     * PICKED_UP -> OUT_FOR_DELIVERY
     */
    @PutMapping("/orders/{id}/out-for-delivery")
    public ResponseEntity<DeliveryOrderResponse> outForDelivery(@PathVariable Long id) {

        return ResponseEntity.ok(deliveryService.markOutForDelivery(id));
    }

    /**
     * OUT_FOR_DELIVERY -> DELIVERED
     */
    @PutMapping("/orders/{id}/delivered")
    public ResponseEntity<DeliveryOrderResponse> delivered(@PathVariable Long id) {

        return ResponseEntity.ok(deliveryService.markDelivered(id));
    }

    /**
     * Completed (and cancelled) deliveries for the logged-in partner.
     */
    @GetMapping("/history")
    public ResponseEntity<List<DeliveryOrderResponse>> history() {

        return ResponseEntity.ok(deliveryService.getHistory());
    }
}
