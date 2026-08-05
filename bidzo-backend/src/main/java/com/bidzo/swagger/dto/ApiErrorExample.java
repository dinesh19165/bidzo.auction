package com.bidzo.swagger.dto;

import java.util.Map;

public class ApiErrorExample {
    private int code;
    private String message;
    private Map<String, Object> details;

    public ApiErrorExample() {}

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
