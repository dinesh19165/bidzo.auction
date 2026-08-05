package com.bidzo.integration.dto;

import java.util.Map;

public class IntegrationRequest {
    private String type;
    private Map<String, Object> payload;

    public IntegrationRequest() {}

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }
}
