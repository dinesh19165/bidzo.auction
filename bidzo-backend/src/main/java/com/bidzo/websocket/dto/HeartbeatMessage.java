package com.bidzo.websocket.dto;

public class HeartbeatMessage {
    private long timestamp;

    public HeartbeatMessage() {}

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
