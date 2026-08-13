package com.grocery.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.grocery.dto.ErrorResponse;
import com.grocery.dto.ValidationErrorResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {


	
    @ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex,HttpServletRequest reqest){
    	 ErrorResponse error = new ErrorResponse(
                 LocalDateTime.now(),
                 HttpStatus.NOT_FOUND.value(),
                 HttpStatus.NOT_FOUND.getReasonPhrase(),
                 ex.getMessage(), 
                 reqest.getRequestURI()
         );

         return ResponseEntity.status(HttpStatus.NOT_FOUND)
                 .body(error);
	}
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex,HttpServletRequest reqest){
    	 ErrorResponse error = new ErrorResponse(
                 LocalDateTime.now(),
                 HttpStatus.CONFLICT.value(),
                 HttpStatus.CONFLICT.getReasonPhrase(),
                 ex.getMessage(),
                 reqest.getRequestURI()
         );

         return ResponseEntity.status(HttpStatus.CONFLICT)
                 .body(error);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStockException(InsufficientStockException ex, HttpServletRequest reqest){
    	 ErrorResponse error = new ErrorResponse(
                 LocalDateTime.now(),
                 HttpStatus.CONFLICT.value(),
                 HttpStatus.CONFLICT.getReasonPhrase(),
                 ex.getMessage(),
                 reqest.getRequestURI()
         );

         return ResponseEntity.status(HttpStatus.CONFLICT)
                 .body(error);
    }
    
    
    @ExceptionHandler(PaymentServiceException.class)
    public ResponseEntity<ErrorResponse> handlePaymentServiceException(
            PaymentServiceException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse,
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(InvalidOrderStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOrderStateException(InvalidOrderStateException ex, HttpServletRequest reqest){
    	 ErrorResponse error = new ErrorResponse(
                 LocalDateTime.now(),
                 HttpStatus.CONFLICT.value(),
                 HttpStatus.CONFLICT.getReasonPhrase(),
                 ex.getMessage(),
                 reqest.getRequestURI()
         );

         return ResponseEntity.status(HttpStatus.CONFLICT)
                 .body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest reqest){
    	 ErrorResponse error = new ErrorResponse(
                 LocalDateTime.now(),
                 HttpStatus.FORBIDDEN.value(),
                 HttpStatus.FORBIDDEN.getReasonPhrase(),
                 ex.getMessage(),
                 reqest.getRequestURI()
         );

         return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest reqest) {

        String message;

        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            message = "Invalid value '" + ex.getValue() + "' for '" + ex.getName()
                    + "'. Allowed values are: "
                    + java.util.Arrays.toString(ex.getRequiredType().getEnumConstants());
        } else {
            message = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'";
        }

        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                reqest.getRequestURI()
        );

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage()));

        ValidationErrorResponse response = new ValidationErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }
    
    
    
    
}
