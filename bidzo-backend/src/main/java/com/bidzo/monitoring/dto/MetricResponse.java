package com.bidzo.monitoring.dto;

import java.util.Map;

public class MetricResponse {
    private String name;
    private Map<String, Object> values;

    public MetricResponse() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Map<String, Object> getValues() { return values; }
    public void setValues(Map<String, Object> values) { this.values = values; }
}
