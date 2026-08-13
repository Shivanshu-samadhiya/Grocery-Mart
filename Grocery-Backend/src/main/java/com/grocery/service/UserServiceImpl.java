package com.grocery.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grocery.dto.UserRegistrationRequest;
import com.grocery.dto.UserResponse;
import com.grocery.dto.UserUpdateRequest;
import com.grocery.entity.User;
import com.grocery.enums.Role;
import com.grocery.exception.DuplicateResourceException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.UserRepository;
import com.grocery.security.SecurityService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor

public class UserServiceImpl  implements UserService{

    private final ModelMapper modelMapper;

	private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

	
    private final SecurityService securityService;
	
	@Override
	public UserResponse registerUser(UserRegistrationRequest request) {
	
		
		// validation
		if (userRepository.existsByEmail(request.getEmail())) {
	        throw new DuplicateResourceException("Email already exists.");
	    }

	    if (userRepository.existsByUsername(request.getUsername())) {
	        throw new DuplicateResourceException("Username already exists.");
	    }
	  
	   
	    if (userRepository.existsByPhone(request.getPhone())) {
	        throw new DuplicateResourceException("Phone number already exists.");
	    }
	    User user = modelMapper.map(request, User.class);
	    

	    
	    user.setPassword(passwordEncoder.encode(request.getPassword()));

	    // A person can self-register as USER or SUPPLIER only.
	    // ADMIN and DELIVERY are never granted through public registration,
	    // no matter what the client sends — those accounts are created by
	    // an admin separately (see AdminService#createDeliveryPartner).
	    if (request.getRole() == Role.ADMIN || request.getRole() == Role.DELIVERY) {
	        user.setRole(Role.USER);
	    } else {
	        user.setRole(request.getRole());
	    }
	    
	    User savedUser = userRepository.save(user);

	    return modelMapper.map(savedUser, UserResponse.class);
		
	}

	@Override
	public UserResponse getUserById(Long userId) {
		  User user = getUserEntityById(userId);
		return modelMapper.map(user, UserResponse.class);
	}

	@Override
	public List<UserResponse> getAllUsers() {
		List<User> users = userRepository.findAll();
		return users.stream().map(user->modelMapper.map(user, UserResponse.class)).toList();
				
	}

	@Override
	public void deleteUser(Long userId) {

		 User user = getUserEntityById(userId);

		    userRepository.delete(user);
	}
	
	
	
	@Override
	public UserResponse updateUser(Long userId, UserUpdateRequest request) {
		
		User user = getUserEntityById(userId);

	    user.setUsername(request.getUsername());
	    user.setPhone(request.getPhone());
	    user.setAddress(request.getAddress());

	    User updatedUser = userRepository.save(user);

	    return modelMapper.map(updatedUser, UserResponse.class);
	}
	
	
	// verifying the Entity
	private User getUserEntityById(Long userId) {

	    return userRepository.findById(userId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("User not found with ID: " + userId));
	}

	@Override
	public UserResponse getMyProfile() {
	    User user = securityService.getLoggedInUser();

	    return modelMapper.map(user, UserResponse.class);

	}


	

}
