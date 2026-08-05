package com.bidzo.sms.dto;

public class OtpRequest {
    private String to;
    private int length = 6;
    private int expireSeconds = 300;

    public OtpRequest() {}

    public OtpRequest(String to, int length, int expireSeconds) {
        this.to = to;
        this.length = length;
        this.expireSeconds = expireSeconds;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getExpireSeconds() {
        return expireSeconds;
    }

    public void setExpireSeconds(int expireSeconds) {
        this.expireSeconds = expireSeconds;
    }
}
