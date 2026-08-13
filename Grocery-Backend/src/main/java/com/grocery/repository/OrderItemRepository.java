package com.grocery.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grocery.entity.Order;
import com.grocery.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

	
    // Get all items belonging to a particular order
    List<OrderItem> findByOrder(Order order);

}
