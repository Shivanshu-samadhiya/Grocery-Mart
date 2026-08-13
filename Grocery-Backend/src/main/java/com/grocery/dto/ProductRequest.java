package com.grocery.dto;

import com.grocery.enums.Category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

	@NotBlank(message = "Product name is required")
	private String name;
	
	@NotBlank(message = "Description is required")
	private String description; 
	
    @NotNull(message = "Category is required")
	private Category category;
	
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
    private Double price;
    
    @NotNull(message = "Stock quantity is required")
    @PositiveOrZero(message = "Stock cannot be negative")
    private Integer stockQuantity;
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
}
