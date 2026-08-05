package com.bidzo.monitoring.dto;

import java.util.Map;

public class SystemStatusResponse {
    private String overallStatus;
    private Map<String, Object> components;

    public SystemStatusResponse() {}

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    public Map<String, Object> getComponents() { return components; }
    public void setComponents(Map<String, Object> components) { this.components = components; }
}
