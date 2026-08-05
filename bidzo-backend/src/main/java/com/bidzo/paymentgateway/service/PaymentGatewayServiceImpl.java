package com.bidzo.paymentgateway.service;

import org.springframework.stereotype.Service;
import com.bidzo.paymentgateway.provider.PaymentProvider;
import com.bidzo.paymentgateway.config.PaymentGatewayProperties;
import com.bidzo.paymentgateway.dto.PaymentRequest;
import com.bidzo.paymentgateway.dto.PaymentResponse;
import com.bidzo.paymentgateway.dto.PaymentVerificationRequest;
import com.bidzo.paymentgateway.dto.PaymentVerificationResponse;
import com.bidzo.paymentgateway.dto.RefundRequest;
import com.bidzo.paymentgateway.dto.RefundResponse;

@Service
public class PaymentGatewayServiceImpl implements PaymentGatewayService {

    private final PaymentProvider provider;
    private final PaymentGatewayProperties properties;

    public PaymentGatewayServiceImpl(PaymentProvider provider, PaymentGatewayProperties properties) {
        this.provider = provider;
        this.properties = properties;
    }

    @Override
    public PaymentResponse initiatePayment(PaymentRequest request) {
        // TODO: validate and delegate
        return provider.initiatePayment(request);
    }

    @Override
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request) {
        // TODO: delegate to provider
        return provider.verifyPayment(request);
    }

    @Override
    public RefundResponse refund(RefundRequest request) {
        // TODO: delegate to provider
        return provider.refund(request);
    }
}
