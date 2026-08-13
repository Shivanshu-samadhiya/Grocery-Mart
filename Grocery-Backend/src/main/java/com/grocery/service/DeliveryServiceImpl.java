package com.grocery.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.grocery.dto.DeliveryDashboardResponse;
import com.grocery.dto.DeliveryOrderResponse;
import com.grocery.entity.Order;
import com.grocery.entity.User;
import com.grocery.enums.OrderStatus;
import com.grocery.exception.InvalidOrderStateException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.OrderRepository;
import com.grocery.security.SecurityService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DeliveryServiceImpl implements DeliveryService {

    private final OrderRepository orderRepository;

    private final SecurityService securityService;

    private static final List<OrderStatus> TERMINAL_STATUSES =
            List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    @Override
    public DeliveryDashboardResponse getDashboard() {

        User partner = securityService.getLoggedInUser();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);

        long todaysAssigned = orderRepository
                .countByDeliveryPartnerAndAssignedAtBetween(partner, startOfToday, startOfTomorrow);

        long pending = orderRepository
                .countByDeliveryPartnerAndStatusNotIn(partner, TERMINAL_STATUSES);

        long completedToday = orderRepository
                .countByDeliveryPartnerAndStatusAndDeliveredAtBetween(
                        partner, OrderStatus.DELIVERED, startOfToday, startOfTomorrow);

        long cancelled = orderRepository
                .countByDeliveryPartnerAndStatus(partner, OrderStatus.CANCELLED);

        return new DeliveryDashboardResponse(todaysAssigned, pending, completedToday, cancelled);
    }

    @Override
    public List<DeliveryOrderResponse> getAssignedOrders() {

        User partner = securityService.getLoggedInUser();

        List<Order> orders =
                orderRepository.findByDeliveryPartnerAndStatusNotIn(partner, TERMINAL_STATUSES);

        return orders.stream().map(this::mapToDeliveryOrderResponse).toList();
    }

    @Override
    public DeliveryOrderResponse acceptOrder(Long orderId) {

        Order order = getOwnedOrder(orderId);

        if (order.getStatus() != OrderStatus.ASSIGNED) {
            throw new InvalidOrderStateException(
                    "Order must be ASSIGNED before it can be accepted. Current status: "
                            + order.getStatus());
        }

        order.setStatus(OrderStatus.PICKED_UP);

        return mapToDeliveryOrderResponse(orderRepository.save(order));
    }

    @Override
    public DeliveryOrderResponse markOutForDelivery(Long orderId) {

        Order order = getOwnedOrder(orderId);

        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new InvalidOrderStateException(
                    "Order must be PICKED_UP before it can go out for delivery. Current status: "
                            + order.getStatus());
        }

        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);

        return mapToDeliveryOrderResponse(orderRepository.save(order));
    }

    @Override
    public DeliveryOrderResponse markDelivered(Long orderId) {

        Order order = getOwnedOrder(orderId);

        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new InvalidOrderStateException(
                    "Order must be OUT_FOR_DELIVERY before it can be marked delivered. Current status: "
                            + order.getStatus());
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        return mapToDeliveryOrderResponse(orderRepository.save(order));
    }

    @Override
    public List<DeliveryOrderResponse> getHistory() {

        User partner = securityService.getLoggedInUser();

        List<Order> orders = orderRepository
                .findByDeliveryPartnerAndStatusInOrderByOrderDateDesc(partner, TERMINAL_STATUSES);

        return orders.stream().map(this::mapToDeliveryOrderResponse).toList();
    }

    // Loads an order and makes sure it is assigned to the currently
    // logged-in delivery partner - a partner can never touch another
    // partner's order, even if they know the order id.
    private Order getOwnedOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));

        User partner = securityService.getLoggedInUser();

        boolean isAssignedToMe =
                order.getDeliveryPartner() != null
                        && order.getDeliveryPartner().getUserId().equals(partner.getUserId());

        if (!isAssignedToMe) {
            throw new AccessDeniedException(
                    "This order is not assigned to you.");
        }

        return order;
    }

    private DeliveryOrderResponse mapToDeliveryOrderResponse(Order order) {

        DeliveryOrderResponse response = new DeliveryOrderResponse();

        response.setOrderId(order.getOrderId());
        response.setCustomerName(order.getUser().getUsername());
        response.setCustomerPhone(order.getUser().getPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setAmount(order.getTotalAmount());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());

        return response;
    }
}
