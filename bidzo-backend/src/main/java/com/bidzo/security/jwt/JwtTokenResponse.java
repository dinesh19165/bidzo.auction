package com.bidzo.security.jwt;

/**
 * Generic token response placeholder (kept separate for flexibility).
 */
public class JwtTokenResponse {
    private String accessToken;
    private String refreshToken;

    public JwtTokenResponse() {}

    public JwtTokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
