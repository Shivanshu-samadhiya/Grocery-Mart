package com.grocery.security.jwt;

import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
@Service
public class JwtService {

	 @Value("${jwt.secret}")
	    private String secretKey;

	    @Value("${jwt.expiration}")
	    private long jwtExpiration;

	    /**
	     * Generate JWT Token
	     */
	    public String generateToken(UserDetails userDetails) {

	        return Jwts.builder()
	                .subject(userDetails.getUsername())
	                .issuedAt(new Date())
	                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
	                .signWith(getSigningKey())
	                .compact();
	    }

	    /**
	     * Extract email(username) from token
	     */
	    public String extractUsername(String token) {

	        return extractClaim(token, Claims::getSubject);
	    }

	    /**
	     * Extract any claim
	     */
	    public <T> T extractClaim(String token,
	                              Function<Claims, T> claimsResolver) {

	        final Claims claims = extractAllClaims(token);

	        return claimsResolver.apply(claims);
	    }

	    /**
	     * Extract all claims
	     */
	    private Claims extractAllClaims(String token) {

	        return Jwts.parser()
	                .verifyWith((javax.crypto.SecretKey) getSigningKey())
	                .build()
	                .parseSignedClaims(token)
	                .getPayload();
	    }

	    /**
	     * Validate token
	     */
	    public boolean isTokenValid(String token,
	                                UserDetails userDetails) {

	        String username = extractUsername(token);

	        return username.equals(userDetails.getUsername())
	                && !isTokenExpired(token);
	    }

	    /**
	     * Check token expiration
	     */
	    private boolean isTokenExpired(String token) {

	        return extractExpiration(token)
	                .before(new Date());
	    }

	    /**
	     * Extract expiration date
	     */
	    private Date extractExpiration(String token) {

	        return extractClaim(token, Claims::getExpiration);
	    }

	    /**
	     * Secret Key
	     */
	    private Key getSigningKey() {

	        return Keys.hmacShaKeyFor(secretKey.getBytes());
	    }
	    
	    
}
