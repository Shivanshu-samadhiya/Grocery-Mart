package com.grocery.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.grocery.dto.ProductPageResponse;
import com.grocery.dto.ProductRequest;
import com.grocery.dto.ProductResponse;
import com.grocery.dto.ProductUpdateRequest;
import com.grocery.enums.Category;

public interface ProductService {

	  ProductResponse addProduct(ProductRequest request);

	    ProductResponse getProductById(Long productId);

//	    List<ProductResponse> getAllProducts();

	    ProductResponse updateProduct(Long productId,
	                                  ProductUpdateRequest request);

	    void deleteProduct(Long productId);
	    
	    List<ProductResponse> searchProducts(String keyword);
	    
	    List<ProductResponse> getProductsByCategory(Category category);

	    ProductPageResponse getAllProducts(
	            int page,
	            int size,
	            String sortBy,
	            String direction);

	    // Products added by the currently logged-in supplier
	    List<ProductResponse> getMyProducts();
	    
	  
	    
}
