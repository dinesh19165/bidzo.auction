package com.bidzo.swagger.dto;

import java.util.Map;

public class ApiSuccessExample {
    private String message;
    private Map<String, Object> data;

    public ApiSuccessExample() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
