package com.bidzo.push.dto;

public class DeviceTokenResponse {
    private String deviceToken;
    private boolean success;

    public DeviceTokenResponse() {}

    public DeviceTokenResponse(String deviceToken, boolean success) {
        this.deviceToken = deviceToken;
        this.success = success;
    }

    public String getDeviceToken() {
        return deviceToken;
    }

    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
