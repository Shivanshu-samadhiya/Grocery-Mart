package com.grocery.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grocery.dto.LoginRequest;
import com.grocery.dto.LoginResponse;
import com.grocery.service.auth.AuthenticationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor


public class AuthController {

	
	 private final AuthenticationService authenticationService;

	    @PostMapping("/login")
	    public ResponseEntity<LoginResponse> login(
	            @Valid @RequestBody LoginRequest request) {

	    	
	    	System.out.println("LOGIN API REACHED");
	    	
	        LoginResponse response = authenticationService.login(request);

	        return ResponseEntity.ok(response);
	    }
	    
	    
	    
}
