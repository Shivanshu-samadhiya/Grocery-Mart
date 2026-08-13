package com.grocery.service.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.grocery.dto.LoginRequest;
import com.grocery.dto.LoginResponse;
import com.grocery.security.CustomUserDetailsService;
import com.grocery.security.jwt.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

	private final AuthenticationManager authenticationManager;

	private final CustomUserDetailsService customUserDetailsService;

	private final JwtService jwtService;
	@Override
	public LoginResponse login(LoginRequest request) {
		  authenticationManager.authenticate(
		            new UsernamePasswordAuthenticationToken(
		                    request.getEmail(),
		                    request.getPassword()
		            )
		    );

		    UserDetails user =
		            customUserDetailsService.loadUserByUsername(request.getEmail());

		    String token =
		            jwtService.generateToken(user);

		    return new LoginResponse(token, "Bearer");
	}

}
