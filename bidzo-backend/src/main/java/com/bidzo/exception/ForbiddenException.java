package com.bidzo.exception;

/**
 * Thrown when an authenticated user does not have permission to perform an action.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
