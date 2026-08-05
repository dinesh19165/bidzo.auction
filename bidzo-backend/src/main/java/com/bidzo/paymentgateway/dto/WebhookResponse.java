package com.bidzo.paymentgateway.dto;

public class WebhookResponse {
    private String status;
    private String info;

    public WebhookResponse() {}

    public WebhookResponse(String status, String info) {
        this.status = status;
        this.info = info;
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
