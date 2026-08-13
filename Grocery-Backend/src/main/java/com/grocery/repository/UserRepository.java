package com.grocery.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grocery.entity.User;
import com.grocery.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

	
	Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
    
    boolean existsByPhone(String phone);
    
    
    long count();

    // All users with a given role, e.g. every DELIVERY partner
    List<User> findByRole(Role role);
    
}
