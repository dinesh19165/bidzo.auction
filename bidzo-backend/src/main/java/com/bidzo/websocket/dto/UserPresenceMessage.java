package com.bidzo.websocket.dto;

public class UserPresenceMessage {
    private String userId;
    private boolean online;

    public UserPresenceMessage() {}

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}
