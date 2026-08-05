package com.bidzo.paymentgateway.dto;

public class PaymentVerificationResponse {
    private String paymentId;
    private boolean verified;
    private String info;

    public PaymentVerificationResponse() {}

    public PaymentVerificationResponse(String paymentId, boolean verified, String info) {
        this.paymentId = paymentId;
        this.verified = verified;
        this.info = info;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }
}
