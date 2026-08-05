package com.bidzo.websocket.dto;

public class NotificationMessage {
    private String title;
    private String body;

    public NotificationMessage() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
