package com.bidzo.integration.exception;

public class ApiTimeoutException extends IntegrationException {
    public ApiTimeoutException(String message) {
        super(message);
    }

    public ApiTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
