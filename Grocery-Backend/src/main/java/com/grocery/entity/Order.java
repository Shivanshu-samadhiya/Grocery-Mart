package com.grocery.entity;

import java.time.LocalDateTime;

import com.grocery.enums.OrderStatus;
import com.grocery.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "orders")
public class Order {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "order_id")
	private Long orderId;

    // Many Orders belong to one User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime orderDate;

    
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    // The delivery partner (a User with role = DELIVERY) this order has
    // been assigned to. Null until the admin assigns one.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_partner_id")
    private User deliveryPartner;

    // When the admin assigned this order to a delivery partner.
    // Used to compute "today's assigned orders" on the delivery dashboard.
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    // When the delivery partner marked this order as DELIVERED.
    // Used to compute "completed today" on the delivery dashboard.
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;


    @PrePersist
    public void onCreate() {

        orderDate = LocalDateTime.now();

        if (status == null) {
            status = OrderStatus.PENDING;
        }

    }
}
