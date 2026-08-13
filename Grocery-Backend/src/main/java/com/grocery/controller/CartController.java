package com.grocery.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.dto.AddToCartRequest;
import com.grocery.dto.CartResponse;
import com.grocery.dto.UpdateCartItemRequest;
import com.grocery.service.CartService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")

public class CartController {

	
    private final CartService cartService;

    
    
    @PreAuthorize("hasRole('USER')")
    // Add To Cart
    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request){
    
    	 CartResponse response = cartService.addToCart(request);

         return ResponseEntity.status(HttpStatus.CREATED)
                 .body(response);
    }
    
    
 // View Cart
    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {

        return ResponseEntity.ok(
                cartService.getMyCart()
        );
    }

    @PreAuthorize("hasRole('USER')")
    // Update Quantity
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        return ResponseEntity.ok(
                cartService.updateCartItem(cartItemId, request)
        );
    }

    @PreAuthorize("hasRole('USER')")
    // Remove One Item
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable Long cartItemId) {

        cartService.removeCartItem(cartItemId);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('USER')")
    // Clear Cart
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {

        cartService.clearMyCart();

        return ResponseEntity.noContent().build();
    }
    
}
