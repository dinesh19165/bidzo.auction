package com.bidzo.security.jwt;

import org.springframework.stereotype.Component;

/**
 * Placeholder for JWT token creation and validation utilities.
 * No implementation provided; methods are placeholders for future work.
 */
@Component
public class JwtTokenProvider {

    public String generateToken(String username) {
        // TODO: implement token generation
        return null;
    }

    public boolean validateToken(String token) {
        // TODO: implement token validation
        return false;
    }

    public String getUsernameFromToken(String token) {
        // TODO: parse username from token
        return null;
    }
}
