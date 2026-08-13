package com.grocery.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grocery.entity.Cart;
import com.grocery.entity.User;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);

}
