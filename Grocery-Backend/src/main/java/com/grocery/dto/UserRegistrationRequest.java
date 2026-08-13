package com.grocery.dto;

import com.grocery.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class UserRegistrationRequest {
	
	@NotBlank(message = "Username is required")
	@Size(min = 3,max = 50,message = "Username must be between 3 and 50 characters")
	private String username;
	@NotBlank(message = "Email Id is required")
	@Email(message = "Invalid Email Id")
	@Pattern(
		    regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
		    message = "Please enter a valid email address"
		)
	private String email;
	@NotBlank(message = "Password is required")
	@Size(min = 6,message = "Password must be atlest 6 characters")
	private String password;

	@NotBlank(message = "Phone number is required")
	@Pattern(
			regexp = "^[6-9]\\d{9}$",
			message = "Invalid phone number"
			)
	private String phone;
	@NotBlank(message = "Address is required")
	private String address;
	
	 @NotNull(message = "Role is required")
	    private Role role;

}
