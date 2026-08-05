package com.bidzo.monitoring.dto;

import java.util.Map;

public class HealthResponse {
    private String status;
    private Map<String, Object> details;

    public HealthResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
