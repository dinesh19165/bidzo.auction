package com.bidzo.common;

import com.bidzo.response.ApiResponse;
import com.bidzo.response.ErrorResponse;
import com.bidzo.response.PageResponse;
import lombok.experimental.UtilityClass;

import java.time.OffsetDateTime;

/**
 * Utility to build consistent ApiResponse objects for success and error flows.
 */
@UtilityClass
public class ResponseBuilder {

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<PageResponse<T>> page(String message, PageResponse<T> page) {
        return ApiResponse.<PageResponse<T>>builder()
                .success(true)
                .message(message)
                .data(page)
                .build();
    }

    public static ApiResponse<ErrorResponse> error(String message, String errorCode, String path) {
        ErrorResponse e = ErrorResponse.builder()
                .message(message)
                .errorCode(errorCode)
                .timestamp(OffsetDateTime.now())
                .path(path)
                .build();
        return ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(message)
                .data(e)
                .errorCode(errorCode)
                .build();
    }
}
