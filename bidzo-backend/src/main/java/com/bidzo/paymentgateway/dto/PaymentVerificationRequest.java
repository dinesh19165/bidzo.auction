package com.bidzo.paymentgateway.dto;

public class PaymentVerificationRequest {
    private String paymentId;
    private String signature;

    public PaymentVerificationRequest() {}

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
