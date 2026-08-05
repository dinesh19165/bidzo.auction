package com.bidzo.paymentgateway.dto;

import java.math.BigDecimal;

public class RefundRequest {
    private String paymentId;
    private BigDecimal amount;

    public RefundRequest() {}

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
