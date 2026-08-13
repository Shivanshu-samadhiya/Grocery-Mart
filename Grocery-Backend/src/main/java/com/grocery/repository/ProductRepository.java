package com.grocery.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.enums.Category;
import java.util.List;


public interface ProductRepository extends JpaRepository<Product, Long> {

	long count();
	
	
	  // Check whether a product with the same name already exists
	boolean existsByName(String name);
	

	 
	 // Find all products of a category
	 List<Product> findByCategory(Category category);
	 
	
	    // Search products by name (case-insensitive)
	    List<Product> findByNameContainingIgnoreCase(String keyword);

	    // Find all products added by a particular supplier
	    List<Product> findBySupplier(User supplier);
	    
	   
	
}
