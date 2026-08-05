package com.bidzo.security.jwt;

/**
 * JWT related constants placeholder.
 */
public final class JwtConstants {
    private JwtConstants() {}

    public static final String AUTH_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final long TOKEN_VALIDITY_SECONDS = 3600L;
    public static final String SECRET_PLACEHOLDER = "CHANGE_ME_TO_SECURE_SECRET";
}
