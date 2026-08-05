package com.bidzo.websocket.dto;

import java.util.Map;

public class WebSocketResponse {
    private String type;
    private Map<String, Object> payload;

    public WebSocketResponse() {}

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
