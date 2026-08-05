package com.bidzo.websocket.dto;

import java.util.Map;

public class WebSocketRequest {
    private String type;
    private Map<String, Object> payload;

    public WebSocketRequest() {}

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
