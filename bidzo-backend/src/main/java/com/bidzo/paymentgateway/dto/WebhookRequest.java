package com.bidzo.paymentgateway.dto;

import java.util.Map;

public class WebhookRequest {
    private String event;
    private Map<String, Object> payload;
    private String signature;

    public WebhookRequest() {}

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
