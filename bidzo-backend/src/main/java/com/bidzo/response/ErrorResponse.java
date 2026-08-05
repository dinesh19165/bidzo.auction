package com.bidzo.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Error response payload used by the global exception handler.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private String message;
    private String errorCode;
    private OffsetDateTime timestamp;
    private String path;
    private Map<String, String> details; // optional field -> e.g. validation errors
}
