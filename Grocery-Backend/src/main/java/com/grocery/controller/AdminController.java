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

import com.grocery.dto.AdminDashboardResponse;
import com.grocery.dto.AssignDeliveryPartnerRequest;
import com.grocery.dto.CreateDeliveryPartnerRequest;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.UserResponse;
import com.grocery.service.AdminService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {

        return ResponseEntity.ok(
                adminService.getDashboardSummary());

    }

    /**
     * Admin creates a delivery partner account (role is always DELIVERY).
     */
    @PostMapping("/delivery-partners")
    public ResponseEntity<UserResponse> createDeliveryPartner(
            @Valid @RequestBody CreateDeliveryPartnerRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createDeliveryPartner(request));
    }

    /**
     * All delivery partner accounts, so the admin can pick one to assign.
     */
    @GetMapping("/delivery-partners")
    public ResponseEntity<List<UserResponse>> getDeliveryPartners() {

        return ResponseEntity.ok(adminService.getDeliveryPartners());
    }

    /**
     * Assign a delivery partner to a CONFIRMED order.
     * Order status moves CONFIRMED -> ASSIGNED.
     */
    @PutMapping("/orders/{orderId}/assign")
    public ResponseEntity<OrderResponse> assignDeliveryPartner(
            @PathVariable Long orderId,
            @Valid @RequestBody AssignDeliveryPartnerRequest request) {

        return ResponseEntity.ok(
                adminService.assignDeliveryPartner(orderId, request));
    }

}
