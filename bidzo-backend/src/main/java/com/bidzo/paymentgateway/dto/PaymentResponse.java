package com.bidzo.paymentgateway.dto;

public class PaymentResponse {
    private String paymentId;
    private String status;
    private String info;

    public PaymentResponse() {}

    public PaymentResponse(String paymentId, String status, String info) {
        this.paymentId = paymentId;
        this.status = status;
        this.info = info;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }
}
