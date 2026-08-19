package com.grocery.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Grocery Backend Order ID
    @Column(nullable = false)
    private Long orderId;

    // Razorpay Order ID
    @Column(unique = true)
    private String razorpayOrderId;

    // Razorpay Payment ID
    @Column(unique = true)
    private String razorpayPaymentId;

    // Amount
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Currency
    @Column(nullable = false)
    private String currency;

    // Payment Method (Known only after payment)
    @Enumerated(EnumType.STRING)
    @Column
    private PaymentMethod paymentMethod;

    // Payment Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    // Razorpay Signature
    private String razorpaySignature;

    // Optional Transaction Reference
    private String transactionId;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {

        createdAt = LocalDateTime.now();

        if (currency == null) {
            currency = "INR";
        }

        if (status == null) {
            status = PaymentStatus.PENDING;
        }

    }

}