package com.bidzo.validation;

/**
 * Centralised validation messages for reuse across DTOs and validators.
 */
public final class ValidationMessages {
    private ValidationMessages() {}

    public static final String NOT_NULL = "must not be null";
    public static final String NOT_EMPTY = "must not be empty";
    public static final String INVALID_EMAIL = "must be a valid email address";
    public static final String INVALID_PHONE = "must be a valid phone number";
    public static final String SIZE = "size must be between {min} and {max}";
}
