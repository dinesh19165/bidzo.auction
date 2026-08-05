package com.bidzo.paymentgateway.service;

import com.bidzo.paymentgateway.dto.PaymentRequest;
import com.bidzo.paymentgateway.dto.PaymentResponse;
import com.bidzo.paymentgateway.dto.PaymentVerificationRequest;
import com.bidzo.paymentgateway.dto.PaymentVerificationResponse;
import com.bidzo.paymentgateway.dto.RefundRequest;
import com.bidzo.paymentgateway.dto.RefundResponse;

public interface PaymentGatewayService {
    PaymentResponse initiatePayment(PaymentRequest request);
    PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request);
    RefundResponse refund(RefundRequest request);
}
