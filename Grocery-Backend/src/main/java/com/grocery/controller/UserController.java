package com.grocery.controller;


import com.grocery.dto.UserRegistrationRequest;
import com.grocery.dto.UserResponse;
import com.grocery.dto.UserUpdateRequest;
import com.grocery.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")

public class UserController {

	
    private final UserService userService;

    
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser( @Valid @RequestBody UserRegistrationRequest request){
    	 UserResponse response = userService.registerUser(request);
    	 
    	 return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId){
    	 UserResponse response = userService.getUserById(userId);
    	 
    	 return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers();

        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPPLIER','DELIVERY')")
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
         @Valid @RequestBody UserUpdateRequest request) {

        return ResponseEntity.ok(userService.updateUser(userId, request));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId) {

        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }
    
    
    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPPLIER','DELIVERY')")
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile() {

        return ResponseEntity.ok(userService.getMyProfile());
    }
    
}
