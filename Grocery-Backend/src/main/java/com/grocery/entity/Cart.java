package com.grocery.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "cart")
public class Cart {
	  @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "cart_id")
	    private Long cartId;

	    @OneToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "user_id", nullable = false, unique = true)
	    private User user;

	    @OneToMany(mappedBy = "cart",
	               cascade = CascadeType.ALL,
	               orphanRemoval = true)
	    private List<CartItem> cartItems = new ArrayList<>();

	    private Double totalAmount = 0.0;

	    private LocalDateTime createdAt;

	    private LocalDateTime updatedAt;
	    
	    @PrePersist
	    public void onCreate() {
	        createdAt = LocalDateTime.now();
	        updatedAt = LocalDateTime.now();
	    }
}
