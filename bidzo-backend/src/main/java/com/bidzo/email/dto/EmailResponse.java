package com.bidzo.email.dto;

public class EmailResponse {
    private String messageId;
    private String status;
    private String info;

    public EmailResponse() {}

    public EmailResponse(String messageId, String status, String info) {
        this.messageId = messageId;
        this.status = status;
        this.info = info;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }
}
