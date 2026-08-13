package com.grocery.service;

import java.util.List;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.grocery.dto.AddToCartRequest;
import com.grocery.dto.CartItemResponse;
import com.grocery.dto.CartResponse;
import com.grocery.dto.UpdateCartItemRequest;
import com.grocery.entity.Cart;
import com.grocery.entity.CartItem;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.exception.InsufficientStockException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.CartItemRepository;
import com.grocery.repository.CartRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.UserRepository;
import com.grocery.security.SecurityService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CartServiceImpl  implements CartService{

	private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SecurityService securityService;
    
    
    
    
	@Override
	public CartResponse addToCart(AddToCartRequest request) {
		
		
       //1.Get User (from JWT, never trust a client-supplied id)
		User user = securityService.getLoggedInUser();
		
// 2.Get Product		
		Product product = getProductEntityById(request.getProductId());
		
	//	3.Find Cart
		Cart cart = cartRepository.findByUser(user)
		        .orElseGet(() -> {

		            Cart newCart = new Cart();
		            newCart.setUser(user);
		            newCart.setTotalAmount(0.0);

		            return cartRepository.save(newCart);
		        });
		
		
		//4.Check if Product Already Exists in Cart
		Optional<CartItem> existingCartItem =
		        cartItemRepository.findByCartAndProduct(cart, product);
		
		
		if (existingCartItem.isPresent()) {

	        // Product already exists -> increase quantity

		    CartItem cartItem = existingCartItem.get();

		    int newQuantity = cartItem.getQuantity() + request.getQuantity();

		    // Check stock availability for the combined quantity
		    if (product.getStockQuantity() < newQuantity) {
		        throw new InsufficientStockException(
		                "Only " + product.getStockQuantity()
		                        + " unit(s) of " + product.getName()
		                        + " available in stock.");
		    }

		    cartItem.setQuantity(newQuantity);

		    double subtotal = product.getPrice() * cartItem.getQuantity();

		    cartItem.setSubtotal(subtotal);

		    cartItemRepository.save(cartItem);
		}
		
		else {

	        // Product does not exist -> create a new CartItem

		    // Check stock availability
		    if (product.getStockQuantity() < request.getQuantity()) {
		        throw new InsufficientStockException(
		                "Only " + product.getStockQuantity()
		                        + " unit(s) of " + product.getName()
		                        + " available in stock.");
		    }

		    CartItem cartItem = new CartItem();

		    cartItem.setCart(cart);

		    cartItem.setProduct(product);

		    cartItem.setQuantity(request.getQuantity());
        
		    
		    cartItem.setSubtotal(
		            request.getQuantity() * product.getPrice()
		    );

		    cartItemRepository.save(cartItem);
		}
		
		 // Step 5: Update Cart Total
	    updateCartTotal(cart);

	    // Step 6: Return Updated Cart
	    return mapToCartResponse(cart);
		
		
	}
	
	
	@Override
	public CartResponse getMyCart() {

		User user = securityService.getLoggedInUser();

		// If the user hasn't added anything yet, return an empty cart
		// instead of a 404 - there's nothing wrong, they just have no cart.
		Cart cart = cartRepository.findByUser(user)
		        .orElseGet(() -> {

		            Cart newCart = new Cart();
		            newCart.setUser(user);
		            newCart.setTotalAmount(0.0);

		            return cartRepository.save(newCart);
		        });

		return mapToCartResponse(cart);
	}
	
	
	
	@Override
	public CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
		
		
		// step 1: Find CartItem
		CartItem cartItem = getCartItemEntityById(cartItemId);
		
	// step 2:Update Quantity (after checking stock availability)
		if (cartItem.getProduct().getStockQuantity() < request.getQuantity()) {
		    throw new InsufficientStockException(
		            "Only " + cartItem.getProduct().getStockQuantity()
		                    + " unit(s) of " + cartItem.getProduct().getName()
		                    + " available in stock.");
		}

		cartItem.setQuantity(request.getQuantity());
		
		//step 3 :Update Subtotal
		cartItem.setSubtotal(
		        cartItem.getProduct().getPrice()
		        * request.getQuantity()
		);
		
		// Step 4 : save
		
		cartItemRepository.save(cartItem);
		
		// Step 5:Update Cart Total

		Cart cart = cartItem.getCart();

		updateCartTotal(cart);
		
		//Step 6: Return
		
		return mapToCartResponse(cart);
	}
	
	
	
	@Override
	public void removeCartItem(Long cartItemId) {

		   // Step 1: Find the CartItem by ID
	    CartItem cartItem = getCartItemEntityById(cartItemId);

	    // Step 2: Store the associated Cart before deleting the CartItem
	    // (Required because once the CartItem is deleted, we still need
	    // to update the cart's total amount.)
	    Cart cart = cartItem.getCart();

	    // Step 3: Delete the CartItem
	    cartItemRepository.delete(cartItem);

	    // Step 4: Recalculate and update the cart's total amount
	    updateCartTotal(cart);
	}
	
	
	
	
	
	@Override
	public void clearMyCart() {

		 // Step 1: Get the logged-in User
	    User user = securityService.getLoggedInUser();

	    // Step 2: Find the Cart associated with the User (nothing to do if none exists yet)
	    Optional<Cart> cartOpt = cartRepository.findByUser(user);

	    if (cartOpt.isEmpty()) {
	        return;
	    }

	    Cart cart = cartOpt.get();

	    // Step 3: Fetch all CartItems belonging to the Cart
	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

	    // Step 4: Delete all CartItems from the Cart
	    cartItemRepository.deleteAll(cartItems);

	    // Step 5: Reset the cart's total amount to zero
	    cart.setTotalAmount(0.0);

	    // Step 6: Save the updated Cart
	    cartRepository.save(cart);
	}
    
	
	
	
	
	// Helper Methods

	 //  * Fetches a Product entity by its ID.

	 private Product getProductEntityById(Long productId) {

	     return productRepository.findById(productId)
	             .orElseThrow(() ->
	                     new ResourceNotFoundException("Product not found."));
	 }
	 
	 
	 
	 
//	 * Fetches a CartItem entity by its ID.
	 
	 private CartItem getCartItemEntityById(Long cartItemId) {

		    return cartItemRepository.findById(cartItemId)
		            .orElseThrow(() ->
		                    new ResourceNotFoundException("Cart Item not found."));
		}
	 
	 
	 
	 
	 
	private void updateCartTotal(Cart cart) {

	    // Fetch all cart items belonging to this cart
	    List<CartItem> cartItems =
	            cartItemRepository.findByCart(cart);

	    // Calculate total amount
	    double totalAmount = cartItems.stream()
	            .mapToDouble(CartItem::getSubtotal)
	            .sum();

	    // Update cart total
	    cart.setTotalAmount(totalAmount);

	    cartRepository.save(cart);
	}
	
	
	
	private CartResponse mapToCartResponse(Cart cart) {

	    // Step 1: Fetch all cart items for the given cart
	    List<CartItem> cartItems = cartItemRepository.findByCart(cart);

	    // Step 2: Convert CartItem entities into CartItemResponse DTOs
	    List<CartItemResponse> itemResponses = cartItems.stream()
	            .map(item -> {

	                CartItemResponse response = new CartItemResponse();

	                response.setCartItemId(item.getCartItemId());
	                response.setProductId(item.getProduct().getProductId());
	                response.setProductName(item.getProduct().getName());
	                response.setPrice(item.getProduct().getPrice());
	                response.setQuantity(item.getQuantity());
	                response.setSubtotal(item.getSubtotal());

	                return response;

	            }).toList();

	    // Step 3: Build the CartResponse DTO
	    CartResponse response = new CartResponse();

	    response.setCartId(cart.getCartId());
	    response.setUserId(cart.getUser().getUserId());
	    response.setItems(itemResponses);
	    response.setTotalAmount(cart.getTotalAmount());

	    // Step 4: Return the complete cart response
	    return response;
	}
	
	
    
    
    
}
