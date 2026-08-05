package com.bidzo.exception;

/**
 * Thrown when a request is not authenticated.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
