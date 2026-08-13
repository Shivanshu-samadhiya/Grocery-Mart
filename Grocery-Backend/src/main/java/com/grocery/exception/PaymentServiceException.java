package com.grocery.exception;

public class PaymentServiceException extends RuntimeException
{

	public PaymentServiceException(String message) {
        super(message);
    }
}
