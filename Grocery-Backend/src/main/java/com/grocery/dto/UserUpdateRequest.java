package com.grocery.dto;

import jakarta.validation.constraints.NotBlank;
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

public class UserUpdateRequest {
	
	 @NotBlank(message = "Username is required")
	    @Size(min = 3, max = 50)
	   private String username;
	 @NotBlank(message = "Phone number is required")
	    @Pattern(
	        regexp = "^[6-9]\\d{9}$",
	        message = "Invalid phone number"
	    )
	    private String phone;
	    @NotBlank(message = "Address is required")
	    private String address;
}
