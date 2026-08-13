package com.grocery.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.grocery.entity.Order;
import com.grocery.entity.User;
import com.grocery.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get all orders placed by a specific user
    List<Order> findByUser(User user);

    
    long count();

    // ---------- Delivery Partner ----------

    // All orders currently or previously assigned to a delivery partner
    List<Order> findByDeliveryPartner(User deliveryPartner);

    // Orders assigned to a delivery partner with a particular status
    List<Order> findByDeliveryPartnerAndStatus(User deliveryPartner, OrderStatus status);

    // Orders assigned to a delivery partner whose status is not in the given list
    // (used for the "active / pending" assigned-orders view)
    List<Order> findByDeliveryPartnerAndStatusNotIn(User deliveryPartner, List<OrderStatus> statuses);

    // Orders assigned to a delivery partner with status in the given list,
    // most recent first (used for delivery history)
    List<Order> findByDeliveryPartnerAndStatusInOrderByOrderDateDesc(
            User deliveryPartner, List<OrderStatus> statuses);

    long countByDeliveryPartnerAndAssignedAtBetween(
            User deliveryPartner, LocalDateTime start, LocalDateTime end);

    long countByDeliveryPartnerAndStatusNotIn(User deliveryPartner, List<OrderStatus> statuses);

    long countByDeliveryPartnerAndStatusAndDeliveredAtBetween(
            User deliveryPartner, OrderStatus status, LocalDateTime start, LocalDateTime end);

    long countByDeliveryPartnerAndStatus(User deliveryPartner, OrderStatus status);

    // How many active (not delivered/cancelled) orders a delivery partner
    // currently has - lets the admin see who's free before assigning.
    @Query("""
           SELECT COUNT(o) FROM Order o
           WHERE o.deliveryPartner = :partner
           AND o.status NOT IN (com.grocery.enums.OrderStatus.DELIVERED, com.grocery.enums.OrderStatus.CANCELLED)
           """)
    long countActiveOrdersForPartner(@Param("partner") User partner);
    
    
    @Query("""
    	       SELECT COALESCE(SUM(o.totalAmount),0)
    	       FROM Order o
    	       """)
    	Double getTotalRevenue();

    // Distinct orders that contain at least one product added by this supplier
    @Query("""
           SELECT DISTINCT oi.order
           FROM OrderItem oi
           WHERE oi.product.supplier = :supplier
           """)
    List<Order> findOrdersContainingSupplierProducts(@Param("supplier") User supplier);
}
