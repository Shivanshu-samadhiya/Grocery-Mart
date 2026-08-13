package com.grocery.service;

import java.util.List;

import com.grocery.dto.UserRegistrationRequest;
import com.grocery.dto.UserResponse;
import com.grocery.dto.UserUpdateRequest;

public interface UserService {
	UserResponse registerUser(UserRegistrationRequest request);

	UserResponse getUserById(Long userId);

	List<UserResponse> getAllUsers();

	void deleteUser(Long userId);
	
	UserResponse updateUser(Long userId, UserUpdateRequest request);

	UserResponse getMyProfile();
}
