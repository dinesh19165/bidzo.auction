package com.bidzo.integration.dto;

public class IntegrationResponse {
    private String status;
    private String info;

    public IntegrationResponse() {}

    public IntegrationResponse(String status, String info) {
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
