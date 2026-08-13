package com.grocery.security.jwt;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.grocery.security.CustomUserDetailsService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter  extends OncePerRequestFilter{

	
    private final JwtService jwtService;

    private final CustomUserDetailsService customUserDetailsService;
	
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

    	
    	System.out.println("================================");
    	System.out.println("REQUEST URI : " + request.getRequestURI());
    	
        // Read Authorization header
        String authHeader = request.getHeader("Authorization");

        
        System.out.println("Authorization Header : " + authHeader);
        
        // If header is missing or doesn't start with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);

            return;
        }
        
        
        System.out.println(
        		 "JWT FILTER : " + request.getRequestURI()
        		);
        
        // Extract JWT
        String jwt = authHeader.substring(7);

        System.out.println("JWT : " + jwt);

        
        try {
			
        	  // Extract email from JWT
            String email = jwtService.extractUsername(jwt);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            System.out.println("Email from JWT : " + email);
            
         // Load User
            UserDetails userDetails =
                    customUserDetailsService.loadUserByUsername(email);
            
            
            System.out.println("User Loaded : " + userDetails.getUsername());

            
            // validate the token
            if(jwtService.isTokenValid(jwt,userDetails)){
            	
            	System.out.println("TOKEN IS VALID");
            	
            	UsernamePasswordAuthenticationToken authentication =
            	        new UsernamePasswordAuthenticationToken(
            	                userDetails,
            	                null,
            	                userDetails.getAuthorities()
            	        );
            	
            	
            	 SecurityContextHolder
                 .getContext()
                 .setAuthentication(authentication);
            	 
            	 System.out.println("USER AUTHENTICATED");
            	 
            	  System.out.println("================================");
            	    System.out.println("Authenticated User : " + authentication.getName());
            	    System.out.println("Authorities : " + authentication.getAuthorities());
            	    System.out.println("================================");

            }
            
            }
            
		} catch (JwtException | UsernameNotFoundException e) {
			
			   // Invalid, expired, or tampered token, or unknown user.
            // Just don't authenticate — Spring Security will return 401/403 on its own.
            SecurityContextHolder.clearContext();
		}
      
        
        
        System.out.println("Authenticated User : "
                + SecurityContextHolder.getContext().getAuthentication());
        
        
        filterChain.doFilter(request, response);

    }
    
	
	
}
