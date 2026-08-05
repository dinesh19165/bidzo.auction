package com.bidzo.integration.dto;

public class PANVerificationRequest {
    private String panNumber;

    public PANVerificationRequest() {}

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }
}
