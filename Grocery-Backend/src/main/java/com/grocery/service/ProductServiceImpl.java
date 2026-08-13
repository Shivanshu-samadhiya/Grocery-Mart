package com.grocery.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.grocery.dto.ProductPageResponse;
import com.grocery.dto.ProductRequest;
import com.grocery.dto.ProductResponse;
import com.grocery.dto.ProductUpdateRequest;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.enums.Category;
import com.grocery.enums.Role;
import com.grocery.exception.DuplicateResourceException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.ProductRepository;
import com.grocery.security.SecurityService;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

	
	
	private final ProductRepository productRepository;
	private final ModelMapper modelMapper;
	private final SecurityService securityService;
	
	@Override
	public ProductResponse addProduct(ProductRequest request) {
		
		if(productRepository.existsByName(request.getName())) {
			throw new DuplicateResourceException("product already exists.");
		}
		Product product = modelMapper.map(request, Product.class);

		// If a SUPPLIER is creating this product, they own it.
		// If an ADMIN creates it, it's left without a specific owner.
		User loggedInUser = securityService.getLoggedInUser();

		if (loggedInUser.getRole() == Role.SUPPLIER) {
			product.setSupplier(loggedInUser);
		}

	    Product savedProduct = productRepository.save(product);

	    return mapToProductResponse(savedProduct);
		
		
	}

	@Override
	public ProductResponse getProductById(Long productId) {
		
		Product product = getProductEntityById(productId);

	    return mapToProductResponse(product);
		
	}

//	@Override
//	public List<ProductResponse> getAllProducts() {
//		 List<Product> products = productRepository.findAll();
//		
//		 
//		return products.stream().map(
//	       product->modelMapper.map(product,ProductResponse.class))
//		.toList();
//	}

	@Override
	public ProductResponse updateProduct(Long productId, ProductUpdateRequest request) {

		
		      Product product = getProductEntityById(productId);

		    assertCanModify(product);

		    if (!product.getName().equalsIgnoreCase(request.getName())
		            && productRepository.existsByName(request.getName())) {

		        throw new DuplicateResourceException("Product already exists.");
		    }
		    
		    product.setName(request.getName());
		    product.setDescription(request.getDescription());
		    product.setCategory(request.getCategory());
		    product.setPrice(request.getPrice());
		    product.setStockQuantity(request.getStockQuantity());
		    product.setImageUrl(request.getImageUrl());

		    Product updatedProduct = productRepository.save(product);

		    return mapToProductResponse(updatedProduct);
	}

	@Override
	public void deleteProduct(Long productId) {
		 Product product = getProductEntityById(productId);

		    assertCanModify(product);

		    productRepository.delete(product);
		
	}

	/**
	 * ADMIN can modify any product. A SUPPLIER may only modify a
	 * product they themselves added.
	 */
	private void assertCanModify(Product product) {

		User loggedInUser = securityService.getLoggedInUser();

		if (loggedInUser.getRole() == Role.ADMIN) {
			return;
		}

		boolean isOwner = product.getSupplier() != null
				&& product.getSupplier().getUserId().equals(loggedInUser.getUserId());

		if (!isOwner) {
			throw new AccessDeniedException(
					"You are not authorized to modify this product.");
		}
	}

	private ProductResponse mapToProductResponse(Product product) {

		ProductResponse response = modelMapper.map(product, ProductResponse.class);

		if (product.getSupplier() != null) {
			response.setSupplierId(product.getSupplier().getUserId());
			response.setSupplierName(product.getSupplier().getUsername());
		}

		return response;
	}
	
	
	private Product getProductEntityById(Long productId) {

	    return productRepository.findById(productId)
	            .orElseThrow(()-> new ResourceNotFoundException(
	               "Product not found with ID : " + productId));
	}

	@Override
	public List<ProductResponse> searchProducts(String keyword) {

	
		 return productRepository.findByNameContainingIgnoreCase(keyword)
		            .stream()
		            .map(this::mapToProductResponse)
		            .toList();
	}

	@Override
	public List<ProductResponse> getProductsByCategory(Category category) {
		
	    List<Product> products = productRepository.findByCategory(category);

	    
	    List<ProductResponse> responseList = new ArrayList<>();

	    for (Product product : products) {

	        ProductResponse response = mapToProductResponse(product);

	        responseList.add(response);
	    }
	    
	    return responseList;

	}

	@Override
	public ProductPageResponse getAllProducts(int page, int size, String sortBy, String direction) {

		
		
		  // Create Sort object
	    Sort sort = direction.equalsIgnoreCase("asc")
	            ? Sort.by(sortBy).ascending()
	            : Sort.by(sortBy).descending();

	    // Create Pageable object
	    Pageable pageable = PageRequest.of(page, size, sort);

	    // Fetch paginated products
	    Page<Product> productPage =
	            productRepository.findAll(pageable);

	    // Convert Product -> ProductResponse
	    List<ProductResponse> productResponses = new ArrayList<>();

	    for (Product product : productPage.getContent()) {

	        ProductResponse response = mapToProductResponse(product);

	        productResponses.add(response);
	    }

	    // Prepare custom response
	    ProductPageResponse pageResponse =
	            new ProductPageResponse();

	    pageResponse.setProducts(productResponses);

	    pageResponse.setCurrentPage(productPage.getNumber());

	    pageResponse.setPageSize(productPage.getSize());

	    pageResponse.setTotalPages(productPage.getTotalPages());

	    pageResponse.setTotalElements(productPage.getTotalElements());

	    pageResponse.setFirst(productPage.isFirst());

	    pageResponse.setLast(productPage.isLast());

	    return pageResponse;
	}

	@Override
	public List<ProductResponse> getMyProducts() {

		User loggedInUser = securityService.getLoggedInUser();

		List<Product> products = productRepository.findBySupplier(loggedInUser);

		return products.stream()
				.map(this::mapToProductResponse)
				.toList();
	}

	



	

	
	
}
