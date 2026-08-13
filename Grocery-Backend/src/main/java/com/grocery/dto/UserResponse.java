package com.grocery.dto;

import com.grocery.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

	private Long userId;
	
    private String username;

    private String email;

    private String phone;

    private String address;

    private Role role;
	
	
}
