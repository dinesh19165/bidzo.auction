package com.bidzo.sms.dto;

public class SmsRequest {
    private String to;
    private String message;
    private String senderId;

    public SmsRequest() {}

    public SmsRequest(String to, String message, String senderId) {
        this.to = to;
        this.message = message;
        this.senderId = senderId;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
}
