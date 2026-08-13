package com.grocery.service.auth;

import com.grocery.dto.LoginRequest;
import com.grocery.dto.LoginResponse;

public interface AuthenticationService {

	
    LoginResponse login(LoginRequest request);

}
