package com.bidzo.websocket.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "websocket")
public class WebSocketProperties {
    private int sessionTimeoutSeconds = 3600;
    private boolean enableHeartbeat = true;

    public int getSessionTimeoutSeconds() {
        return sessionTimeoutSeconds;
    }

    public void setSessionTimeoutSeconds(int sessionTimeoutSeconds) {
        this.sessionTimeoutSeconds = sessionTimeoutSeconds;
    }

    public boolean isEnableHeartbeat() {
        return enableHeartbeat;
    }

    public void setEnableHeartbeat(boolean enableHeartbeat) {
        this.enableHeartbeat = enableHeartbeat;
    }
}
