package com.grocery.service;

import com.grocery.dto.AddToCartRequest;
import com.grocery.dto.CartResponse;
import com.grocery.dto.UpdateCartItemRequest;


public interface CartService {
    // Add a product to the cart
    CartResponse addToCart(AddToCartRequest request);

    // View the logged-in user's cart
    CartResponse getMyCart();

    // Update quantity of a cart item
    CartResponse updateCartItem(Long cartItemId,
                                UpdateCartItemRequest request);

    // Remove one product from the cart
    void removeCartItem(Long cartItemId);

    // Remove all products from the logged-in user's cart
    void clearMyCart();
}
