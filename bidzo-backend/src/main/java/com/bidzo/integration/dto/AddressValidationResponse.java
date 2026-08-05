package com.bidzo.integration.dto;

public class AddressValidationResponse {
    private boolean valid;
    private String info;

    public AddressValidationResponse() {}

    public AddressValidationResponse(boolean valid, String info) {
        this.valid = valid;
        this.info = info;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }
}
