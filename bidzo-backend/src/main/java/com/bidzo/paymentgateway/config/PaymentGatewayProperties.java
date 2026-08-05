package com.bidzo.paymentgateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payment.gateway")
public class PaymentGatewayProperties {
    private String provider = "razorpay";
    private String razorpayKey;
    private String razorpaySecret;
    private String stripeApiKey;
    private String cashfreeAppId;
    private String phonePeMerchantId;
    private String paytmMerchantId;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getRazorpayKey() {
        return razorpayKey;
    }

    public void setRazorpayKey(String razorpayKey) {
        this.razorpayKey = razorpayKey;
    }

    public String getRazorpaySecret() {
        return razorpaySecret;
    }

    public void setRazorpaySecret(String razorpaySecret) {
        this.razorpaySecret = razorpaySecret;
    }

    public String getStripeApiKey() {
        return stripeApiKey;
    }

    public void setStripeApiKey(String stripeApiKey) {
        this.stripeApiKey = stripeApiKey;
    }

    public String getCashfreeAppId() {
        return cashfreeAppId;
    }

    public void setCashfreeAppId(String cashfreeAppId) {
        this.cashfreeAppId = cashfreeAppId;
    }

    public String getPhonePeMerchantId() {
        return phonePeMerchantId;
    }

    public void setPhonePeMerchantId(String phonePeMerchantId) {
        this.phonePeMerchantId = phonePeMerchantId;
    }

    public String getPaytmMerchantId() {
        return paytmMerchantId;
    }

    public void setPaytmMerchantId(String paytmMerchantId) {
        this.paytmMerchantId = paytmMerchantId;
    }
}
