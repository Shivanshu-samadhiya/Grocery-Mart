package com.grocery.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.dto.ProductPageResponse;
import com.grocery.dto.ProductRequest;
import com.grocery.dto.ProductResponse;
import com.grocery.dto.ProductUpdateRequest;
import com.grocery.enums.Category;
import com.grocery.service.ProductService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")

public class ProductController {

	
	private final ProductService productService;
	
	
	
	// Add a 
	@PreAuthorize("hasAnyRole('ADMIN','SUPPLIER')")
	 @PostMapping
	public ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody ProductRequest request){
		
		 System.out.println(request.getName());
		 System.out.println(request.getPrice());
		 
		ProductResponse response = productService.addProduct(request);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
    // Get Product By Id
	
	
	 @GetMapping("/{productId}")
	    public ResponseEntity<ProductResponse> getProductById( @PathVariable Long productId) {

	        return ResponseEntity.ok(productService.getProductById(productId));
	    }
	 
	 
//	 // Get All Products
//	 
//	 @GetMapping
//	 public ResponseEntity<List<ProductResponse>> getAllProducts(){
//		 return ResponseEntity.ok(productService.getAllProducts());
//	 }
//	
	// Update Product
	@PreAuthorize("hasAnyRole('ADMIN','SUPPLIER')")
	    @PutMapping("/{productId}")
	    public ResponseEntity<ProductResponse> updateProduct(
	            @PathVariable Long productId,
	            @Valid @RequestBody ProductUpdateRequest request) {

	        return ResponseEntity.ok(
	                productService.updateProduct(productId, request));
	    }
	    
	    // Delete Product
	 @PreAuthorize("hasAnyRole('ADMIN','SUPPLIER')")
	    @DeleteMapping("/{productId}")
	    public ResponseEntity<Void> deleteProduct(
	            @PathVariable Long productId) {

	        productService.deleteProduct(productId);

	        return ResponseEntity.noContent().build();
	    }
	 
	    // Search a Product
	    @GetMapping("/search")
	    public ResponseEntity<List<ProductResponse>> searchProducts(
	            @RequestParam String keyword) {

	        List<ProductResponse> response = productService.searchProducts(keyword);

	        return ResponseEntity.ok(response);
	    }
	    
	    
	    
	    // filter by specific category.
	    @GetMapping("/category/{category}")
	    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
	            @PathVariable Category category) {

	        List<ProductResponse> response =
	                productService.getProductsByCategory(category);

	        return ResponseEntity.ok(response);
	    }
	    
	    /**
	     * Returns all products with pagination and sorting.
	 
	     */
	    @GetMapping
	    public ResponseEntity<ProductPageResponse> getAllProducts(

	            @RequestParam(defaultValue = "0") int page,

	            @RequestParam(defaultValue = "5") int size,

	            @RequestParam(defaultValue = "productId") String sortBy,

	            @RequestParam(defaultValue = "asc") String direction) {

	        ProductPageResponse response =
	                productService.getAllProducts(
	                        page,
	                        size,
	                        sortBy,
	                        direction);

	        return ResponseEntity.ok(response);
	    }
	    

	    /**
	     * Returns only the products added by the currently logged-in supplier.
	     */
	    @PreAuthorize("hasRole('SUPPLIER')")
	    @GetMapping("/my-products")
	    public ResponseEntity<List<ProductResponse>> getMyProducts() {

	        return ResponseEntity.ok(productService.getMyProducts());
	    }
	  
}
