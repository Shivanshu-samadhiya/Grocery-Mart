package com.grocery.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Used by an admin to create a delivery partner account. Unlike
 * UserRegistrationRequest, there is no "role" field here - the service
 * always creates the account with role = DELIVERY.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeliveryPartnerRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email Id is required")
    @Email(message = "Invalid Email Id")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be atleast 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid phone number"
    )
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;
}
