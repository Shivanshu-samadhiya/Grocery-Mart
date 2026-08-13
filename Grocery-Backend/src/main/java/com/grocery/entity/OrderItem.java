package com.grocery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "order_items")
public class OrderItem {
	     @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	     @Column(name = "order_item_id")
	     private Long orderItemId;

	    // Many OrderItems belong to one Order
	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "order_id", nullable = false)
	    private Order order;

	    // Many OrderItems refer to one Product
	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "product_id", nullable = false)
	    private Product product;

	    @Column(nullable = false)
	    private Integer quantity;

	    // Price of the product at the time of purchase
	    @Column(nullable = false)
	    private Double price;
	    
	    @Column(nullable = false)
	    private Double subtotal;
}
