package com.grocery.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.grocery.entity.User;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Single source of truth for "who is making this request".
 *
 * JWT -> Email (SecurityContext) -> User Entity
 *
 * Every service should use this instead of trusting a userId sent
 * by the client, so a user can never act on someone else's data by
 * simply changing an ID in the request.
 */
@Service
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;

    /**
     * Returns the fully loaded User entity for whoever is currently
     * authenticated (resolved from the JWT via the CustomUserDetails
     * that was placed in the SecurityContext by JwtAuthenticationFilter).
     */
    public User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found.");
        }

        // CustomUserDetails#getUsername() returns the user's email
        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Logged-in user not found."));
    }

    /**
     * Convenience helper for endpoints that just need the id.
     */
    public Long getLoggedInUserId() {
        return getLoggedInUser().getUserId();
    }
}
