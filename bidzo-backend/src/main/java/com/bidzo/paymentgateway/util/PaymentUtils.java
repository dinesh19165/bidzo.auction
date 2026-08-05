package com.bidzo.paymentgateway.util;

import java.util.UUID;

public final class PaymentUtils {
    private PaymentUtils() {}

    public static String generateTransactionId() {
        return UUID.randomUUID().toString();
    }

    // TODO: add currency/amount helpers
}
