package com.grocery.service;

import java.util.List;

import com.grocery.dto.AdminDashboardResponse;
import com.grocery.dto.AssignDeliveryPartnerRequest;
import com.grocery.dto.CreateDeliveryPartnerRequest;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.UserResponse;

public interface AdminService {

	
	AdminDashboardResponse getDashboardSummary();

	// Create a new delivery partner account (role is always forced to DELIVERY)
	UserResponse createDeliveryPartner(CreateDeliveryPartnerRequest request);

	// All delivery partner accounts
	List<UserResponse> getDeliveryPartners();

	// Assign a delivery partner to an already-confirmed order.
	// Order status moves from CONFIRMED to ASSIGNED.
	OrderResponse assignDeliveryPartner(Long orderId, AssignDeliveryPartnerRequest request);

}
