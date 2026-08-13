package com.grocery.dto;

import com.grocery.enums.Category;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

	private Long productId;
	private String name;
    private String description;
    private Category category;
    private Double price;
    private Integer stockQuantity;
    private String imageUrl;
    private Long supplierId;
    private String supplierName;
}
