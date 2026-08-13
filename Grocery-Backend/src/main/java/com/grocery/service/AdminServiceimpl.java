package com.grocery.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grocery.dto.AdminDashboardResponse;
import com.grocery.dto.AssignDeliveryPartnerRequest;
import com.grocery.dto.CreateDeliveryPartnerRequest;
import com.grocery.dto.OrderItemResponse;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.UserResponse;
import com.grocery.entity.Order;
import com.grocery.entity.OrderItem;
import com.grocery.entity.User;
import com.grocery.enums.OrderStatus;
import com.grocery.enums.Role;
import com.grocery.exception.DuplicateResourceException;
import com.grocery.exception.InvalidOrderStateException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.OrderItemRepository;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceimpl implements AdminService {

	private final UserRepository userRepository;

	private final ProductRepository productRepository;

	private final OrderRepository orderRepository;

	private final OrderItemRepository orderItemRepository;

	private final PasswordEncoder passwordEncoder;

	private final ModelMapper modelMapper;

	@Override
	public AdminDashboardResponse getDashboardSummary() {

		return new AdminDashboardResponse(

				userRepository.count(),

				productRepository.count(),

				orderRepository.count(),

				orderRepository.getTotalRevenue()

		);

	}

	@Override
	public UserResponse createDeliveryPartner(CreateDeliveryPartnerRequest request) {

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateResourceException("Email already exists.");
		}

		if (userRepository.existsByUsername(request.getUsername())) {
			throw new DuplicateResourceException("Username already exists.");
		}

		if (userRepository.existsByPhone(request.getPhone())) {
			throw new DuplicateResourceException("Phone number already exists.");
		}

		User deliveryPartner = new User();
		deliveryPartner.setUsername(request.getUsername());
		deliveryPartner.setEmail(request.getEmail());
		deliveryPartner.setPassword(passwordEncoder.encode(request.getPassword()));
		deliveryPartner.setPhone(request.getPhone());
		deliveryPartner.setAddress(request.getAddress());
		deliveryPartner.setRole(Role.DELIVERY);

		User savedPartner = userRepository.save(deliveryPartner);

		return modelMapper.map(savedPartner, UserResponse.class);
	}

	@Override
	public List<UserResponse> getDeliveryPartners() {

		return userRepository.findByRole(Role.DELIVERY).stream()
				.map(user -> modelMapper.map(user, UserResponse.class))
				.toList();
	}

	@Override
	public OrderResponse assignDeliveryPartner(Long orderId, AssignDeliveryPartnerRequest request) {

		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order not found."));

		// Only a confirmed order is ready to be handed to a delivery partner
		if (order.getStatus() != OrderStatus.CONFIRMED) {
			throw new InvalidOrderStateException(
					"Only a CONFIRMED order can be assigned to a delivery partner. Current status: "
							+ order.getStatus());
		}

		User partner = userRepository.findById(request.getDeliveryPartnerId())
				.orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found."));

		if (partner.getRole() != Role.DELIVERY) {
			throw new InvalidOrderStateException(
					"Selected user is not a delivery partner.");
		}

		order.setDeliveryPartner(partner);
		order.setAssignedAt(LocalDateTime.now());
		order.setStatus(OrderStatus.ASSIGNED);

		Order savedOrder = orderRepository.save(order);

		return mapToOrderResponse(savedOrder);
	}

	private OrderResponse mapToOrderResponse(Order order) {

		OrderResponse response = new OrderResponse();

		response.setOrderId(order.getOrderId());
		response.setUserId(order.getUser().getUserId());
		response.setDeliveryAddress(order.getDeliveryAddress());
		response.setStatus(order.getStatus());
		response.setOrderDate(order.getOrderDate());
		response.setTotalAmount(order.getTotalAmount());
		response.setPaymentId(order.getPaymentId());
		response.setRazorpayOrderId(order.getRazorpayOrderId());
		response.setPaymentStatus(order.getPaymentStatus());

		List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

		List<OrderItemResponse> itemResponses = new ArrayList<>();

		for (OrderItem item : orderItems) {

			OrderItemResponse itemResponse = new OrderItemResponse();

			itemResponse.setOrderItemId(item.getOrderItemId());
			itemResponse.setProductId(item.getProduct().getProductId());
			itemResponse.setProductName(item.getProduct().getName());
			itemResponse.setPrice(item.getPrice());
			itemResponse.setQuantity(item.getQuantity());
			itemResponse.setSubtotal(item.getSubtotal());

			itemResponses.add(itemResponse);
		}

		response.setItems(itemResponses);

		return response;
	}

}
