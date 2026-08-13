package com.grocery.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

	   private Long cartId;

	    private Long userId;

	    private List<CartItemResponse> items;

	    private Double totalAmount;
}
