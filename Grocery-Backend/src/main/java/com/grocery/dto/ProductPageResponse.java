package com.grocery.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class ProductPageResponse {

    // List of products for the current page
    private List<ProductResponse> products;

    // Current page number
    private int currentPage;

    // Number of records per page
    private int pageSize;

    // Total number of pages
    private int totalPages;

    // Total products in database
    private long totalElements;

    // Is this the first page?
    private boolean first;

    // Is this the last page?
    private boolean last;
}
