package com.grocery.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.grocery.dto.OrderItemResponse;
import com.grocery.dto.OrderResponse;
import com.grocery.dto.PlaceOrderRequest;
import com.grocery.dto.UpdateOrderStatusRequest;
import com.grocery.dto.UpdatePaymentStatusRequest;
import com.grocery.entity.Cart;
import com.grocery.entity.CartItem;
import com.grocery.entity.Order;
import com.grocery.entity.OrderItem;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.enums.OrderStatus;
import com.grocery.exception.InsufficientStockException;
import com.grocery.exception.InvalidOrderStateException;
import com.grocery.exception.PaymentServiceException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.payment.client.PaymentClient;
import com.grocery.payment.dto.CreatePaymentRequest;
import com.grocery.payment.dto.CreatePaymentResponse;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.CartRepository;
import com.grocery.repository.OrderItemRepository;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.security.SecurityService;

import feign.FeignException;
import feign.RetryableException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

	
	private final OrderRepository orderRepository;

	private final OrderItemRepository orderItemRepository;

	private final CartRepository cartRepository;

	private final CartItemRepository cartItemRepository;

	private final ProductRepository productRepository;

	private final ModelMapper modelMapper;

	private final SecurityService securityService;
	
	
	private final PaymentClient paymentClient;
	
	@Override
	public OrderResponse placeOrder(PlaceOrderRequest request) {



	    // Step 1: Get the logged-in user (from JWT, never trust a client-supplied id)
	    User user = securityService.getLoggedInUser();

	    // Step 2: Find the user's cart
	    Cart cart = getCartByUser(user);

	    // Step 3: Get all cart items
	    List<CartItem> cartItems = getCartItems(cart);

	    // Step 4: Check if cart is empty
	    if (cartItems.isEmpty()) {
	        throw new InvalidOrderStateException("Cart is empty. Cannot place order.");
	    }

	    // Step 5: Create a new order
	    Order order = new Order();
	    order.setUser(user);
	    order.setDeliveryAddress(request.getDeliveryAddress());
	    order.setTotalAmount(cart.getTotalAmount());

	    // Save order
	    Order savedOrder = orderRepository.save(order);

	    // Process each cart item
	    for (CartItem cartItem : cartItems) {

	        Product product = cartItem.getProduct();

	        // Check stock availability
	        if (product.getStockQuantity() < cartItem.getQuantity()) {
	            throw new InsufficientStockException(
	                    "Insufficient stock for product: " + product.getName());
	        }

	        // Create order item
	        OrderItem orderItem = new OrderItem();
	        orderItem.setOrder(savedOrder);
	        orderItem.setProduct(product);
	        orderItem.setQuantity(cartItem.getQuantity());
	        orderItem.setPrice(product.getPrice());
	        orderItem.setSubtotal(product.getPrice() * cartItem.getQuantity());

	        // Save order item
	        orderItemRepository.save(orderItem);

	        // Update product stock
	        product.setStockQuantity(
	                product.getStockQuantity() - cartItem.getQuantity());

	        productRepository.save(product);
	    }

	    // Remove all cart items
	    cartItemRepository.deleteAll(cartItems);

	    // Reset cart total
	    cart.setTotalAmount(0.0);

	    // Save empty cart
	    cartRepository.save(cart);
	    
	 // Call Payment Microservice
	 // ----------------------------

	    CreatePaymentResponse paymentResponse;

	    
	    try {
	    	
	    	CreatePaymentRequest paymentRequest =
	   	         CreatePaymentRequest.builder()
	   	                 .orderId(savedOrder.getOrderId())
	   	                 .amount(BigDecimal.valueOf(savedOrder.getTotalAmount()))
	   	                 .build();
            paymentResponse =paymentClient.createPayment(paymentRequest);
	   	 
			
            
            
		} catch (RetryableException ex) {
		    throw new PaymentServiceException(
		            "Payment Service is currently unavailable. Please try again later.");
		}
	    
	    catch(FeignException ex) {
	    	  throw new PaymentServiceException(
	    	            "Unable to process payment. Please try again.");
	    }
	 
	 
	 
	// ===============================
	// SAVE PAYMENT DETAILS IN DATABASE
	// ===============================

	savedOrder.setPaymentId(paymentResponse.getPaymentId());

	savedOrder.setRazorpayOrderId(
	        paymentResponse.getRazorpayOrderId());

	savedOrder.setPaymentStatus(
	        paymentResponse.getStatus());

	
	savedOrder = orderRepository.save(savedOrder);
	 
	 

	    // Return response
	 OrderResponse response = mapToOrderResponse(savedOrder);

	
	    
	 return response;
	    
	}

	@Override
	public OrderResponse getOrderById(Long orderId) {


		 // Find the order by ID
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Order not found."));

	    // Ownership check: a user may only view their own order
	    User loggedInUser = securityService.getLoggedInUser();

	    boolean isOwner =
	            order.getUser().getUserId()
	                    .equals(loggedInUser.getUserId());

	    if (!isOwner) {
	        throw new AccessDeniedException(
	                "You are not authorized to view this order.");
	    }

	    // Convert Order entity into OrderResponse DTO
	    return mapToOrderResponse(order);
	}

	@Override
	public List<OrderResponse> getMyOrders() {

	    // Get the logged-in user
	    User user = securityService.getLoggedInUser();

	    // Fetch all orders placed by the user
	    List<Order> orders = orderRepository.findByUser(user);

	    // List that will store the response DTOs
	    List<OrderResponse> responses = new ArrayList<>();

	    // Convert each Order into OrderResponse
	    for (Order order : orders) {
	        responses.add(mapToOrderResponse(order));
	    }

	    return responses;
	}

	@Override
	public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {

	    // Find the order
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Order not found."));

	    // Terminal states cannot be moved out of via this generic endpoint
	    if (order.getStatus() == OrderStatus.DELIVERED
	            || order.getStatus() == OrderStatus.CANCELLED) {
	        throw new InvalidOrderStateException(
	                "Order is already " + order.getStatus()
	                        + " and its status cannot be changed further.");
	    }

	    // Cancellation must go through cancelOrder() so that stock gets restored
	    if (request.getStatus() == OrderStatus.CANCELLED) {
	        throw new InvalidOrderStateException(
	                "Use the cancel order endpoint to cancel an order.");
	    }

	    // Update the order status
	    order.setStatus(request.getStatus());

	    // Save the updated order
	    Order updatedOrder = orderRepository.save(order);

	    // Return updated response
	    return mapToOrderResponse(updatedOrder);
		
	}

	@Override
	public OrderResponse cancelOrder(Long orderId) {

	    // Step 1: Find the order
	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Order not found."));

	    // Step 1b: Ownership check - a user may only cancel their own order
	    User loggedInUser = securityService.getLoggedInUser();

	    boolean isOwner =
	            order.getUser().getUserId()
	                    .equals(loggedInUser.getUserId());

	    if (!isOwner) {
	        throw new AccessDeniedException(
	                "You are not authorized to view this order.");
	    }
	    
	    // Step 2: An order that is already delivered or cancelled cannot be cancelled
	    if (order.getStatus() == OrderStatus.DELIVERED) {
	        throw new InvalidOrderStateException(
	                "Delivered orders cannot be cancelled.");
	    }

	    if (order.getStatus() == OrderStatus.CANCELLED) {
	        throw new InvalidOrderStateException(
	                "Order is already cancelled.");
	    }

	    // Step 3: Restore stock for every item in the order
	    List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

	    for (OrderItem item : orderItems) {

	        Product product = item.getProduct();

	        product.setStockQuantity(
	                product.getStockQuantity() + item.getQuantity());

	        productRepository.save(product);
	    }

	    // Step 4: Mark the order as cancelled
	    order.setStatus(OrderStatus.CANCELLED);

	    Order cancelledOrder = orderRepository.save(order);

	    // Step 5: Return the updated response
	    return mapToOrderResponse(cancelledOrder);
	}

	
	
	// 1. getCartByUser()
	
	private Cart getCartByUser(User user) {

	    return cartRepository.findByUser(user)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Cart not found."));
	}
	
	// 3. getCartItems()
	
	private List<CartItem> getCartItems(Cart cart) {

	    return cartItemRepository.findByCart(cart);
	}
	
//	 * Converts an Order entity into an OrderResponse DTO.

	private OrderResponse mapToOrderResponse(Order order) {

	    // Create the response object
	    OrderResponse response = new OrderResponse();

	    // Set basic order information
	    response.setOrderId(order.getOrderId());
	    response.setUserId(order.getUser().getUserId());
	    response.setDeliveryAddress(order.getDeliveryAddress());
	    response.setStatus(order.getStatus());
	    response.setOrderDate(order.getOrderDate());
	    response.setTotalAmount(order.getTotalAmount());

	    
	    
	 // Payment Details
	    response.setPaymentId(order.getPaymentId());
	    response.setRazorpayOrderId(order.getRazorpayOrderId());
	    response.setPaymentStatus(order.getPaymentStatus());
	    
	    
	    // Fetch all items belonging to this order
	    List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

	    // List that will store all OrderItemResponse objects
	    List<OrderItemResponse> itemResponses = new ArrayList<>();

	    // Convert every OrderItem into OrderItemResponse
	    for (OrderItem item : orderItems) {

	        OrderItemResponse itemResponse = new OrderItemResponse();

	        itemResponse.setOrderItemId(item.getOrderItemId());

	        itemResponse.setProductId(item.getProduct().getProductId());

	        itemResponse.setProductName(item.getProduct().getName());

	        itemResponse.setPrice(item.getPrice());

	        itemResponse.setQuantity(item.getQuantity());

	        itemResponse.setSubtotal(item.getSubtotal());

	        // Add the converted item to the response list
	        itemResponses.add(itemResponse);
	    }

	    // Attach all order items to the response
	    response.setItems(itemResponses);

	    return response;
	}

	@Override
	public List<OrderResponse> getAllOrders() {
		List<Order> orders = orderRepository.findAll();

	    return orders.stream()
	            .map(this::mapToOrderResponse)
	            .toList();
	}

	@Override
	public OrderResponse updatePaymentStatus(UpdatePaymentStatusRequest request) {
		  Order order = orderRepository.findById(request.getOrderId())
		            .orElseThrow(() ->
		                    new ResourceNotFoundException("Order Not Found"));

		    order.setPaymentStatus(request.getPaymentStatus());

		    Order updatedOrder = orderRepository.save(order);

		    return mapToOrderResponse(updatedOrder);
	}

	@Override
	public List<OrderResponse> getSupplierOrders() {

		// Get the logged-in supplier
		User supplier = securityService.getLoggedInUser();

		// Every order that contains at least one of this supplier's products
		List<Order> orders =
				orderRepository.findOrdersContainingSupplierProducts(supplier);

		return orders.stream()
				.map(order -> mapToOrderResponseForSupplier(order, supplier))
				.toList();
	}

	/**
	 * Same as mapToOrderResponse(), but only includes order items whose
	 * product belongs to the given supplier — a supplier should only see
	 * their own line items within someone else's order, not the whole order.
	 */
	private OrderResponse mapToOrderResponseForSupplier(Order order, User supplier) {

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

	        boolean belongsToSupplier =
	                item.getProduct().getSupplier() != null
	                        && item.getProduct().getSupplier().getUserId()
	                                .equals(supplier.getUserId());

	        if (!belongsToSupplier) {
	            continue;
	        }

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
