package com.bidzo.response;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Error response payload used by the global exception handler.
 */
public class ErrorResponse {
    private String message;
    private String errorCode;
    private OffsetDateTime timestamp;
    private String path;
    private Map<String, String> details; // optional field -> e.g. validation errors

    public ErrorResponse() {
    }

    public ErrorResponse(String message, String errorCode, OffsetDateTime timestamp, String path, Map<String, String> details) {
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = timestamp;
        this.path = path;
        this.details = details;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String message;
        private String errorCode;
        private OffsetDateTime timestamp;
        private String path;
        private Map<String, String> details;

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder errorCode(String errorCode) {
            this.errorCode = errorCode;
            return this;
        }

        public Builder timestamp(OffsetDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder details(Map<String, String> details) {
            this.details = details;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(message, errorCode, timestamp, path, details);
        }
    }
}
