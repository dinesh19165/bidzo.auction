package com.bidzo.paymentgateway.provider;

import org.springframework.stereotype.Component;
import com.bidzo.paymentgateway.dto.PaymentRequest;
import com.bidzo.paymentgateway.dto.PaymentResponse;
import com.bidzo.paymentgateway.dto.PaymentVerificationRequest;
import com.bidzo.paymentgateway.dto.PaymentVerificationResponse;
import com.bidzo.paymentgateway.dto.RefundRequest;
import com.bidzo.paymentgateway.dto.RefundResponse;
import com.bidzo.paymentgateway.config.PaymentGatewayProperties;

@Component
public class CashfreeProvider implements PaymentProvider {

    private final PaymentGatewayProperties properties;

    public CashfreeProvider(PaymentGatewayProperties properties) {
        this.properties = properties;
    }

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        // TODO: implement Cashfree payment initiation
        return new PaymentResponse(null, "NOT_IMPLEMENTED", null);
    }

    @Override
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request) {
        // TODO: implement Cashfree payment verification
        return new PaymentVerificationResponse(null, false, "NOT_IMPLEMENTED");
    }

    @Override
    public RefundResponse refund(RefundRequest request) {
        // TODO: implement Cashfree refund
        return new RefundResponse(null, "NOT_IMPLEMENTED");
    }
}
