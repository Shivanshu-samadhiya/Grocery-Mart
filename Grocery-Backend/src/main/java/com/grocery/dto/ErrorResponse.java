
package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Setter
@NoArgsConstructor
@Builder
public class ErrorResponse {
	
	 private LocalDateTime timestamp;
	    private int status;
	    private String error;
	    private String message;
	    private String path;
	    

}
