package com.bidzo.paymentgateway.exception;

public class RefundException extends PaymentGatewayException {
    public RefundException(String message) {
        super(message);
    }

    public RefundException(String message, Throwable cause) {
        super(message, cause);
    }
}
