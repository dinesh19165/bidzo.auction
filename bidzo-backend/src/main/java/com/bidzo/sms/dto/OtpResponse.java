package com.bidzo.sms.dto;

import java.time.Instant;

public class OtpResponse {
    private String otp;
    private Instant expiresAt;
    private String reference;

    public OtpResponse() {}

    public OtpResponse(String otp, Instant expiresAt, String reference) {
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.reference = reference;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }
}
