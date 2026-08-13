package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardResponse {

	  private Long totalUsers;

	    private Long totalProducts;

	    private Long totalOrders;

	    private Double totalRevenue;

}
