package com.bidzo.exception;

import com.bidzo.response.ApiResponse;
import com.bidzo.response.ErrorResponse;
import com.bidzo.constants.ErrorCodes;
import com.bidzo.util.DateUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.Collections;

/**
 * Centralized exception handler mapping known exceptions to consistent API responses.
 * Keeps responses uniform and supplies error metadata for clients.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBusiness(BusinessException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode() != null ? ex.getErrorCode() : ErrorCodes.BUSINESS_ERROR.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(null)
                .build();

        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(ex.getMessage())
                .data(error)
                .errorCode(error.getErrorCode())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode() != null ? ex.getErrorCode() : ErrorCodes.NOT_FOUND.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(null)
                .build();
        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(ex.getMessage())
                .data(error)
                .errorCode(error.getErrorCode())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ErrorCodes.UNAUTHORIZED.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(null)
                .build();
        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(ex.getMessage())
                .data(error)
                .errorCode(error.getErrorCode())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleForbidden(ForbiddenException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ErrorCodes.FORBIDDEN.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(null)
                .build();
        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(ex.getMessage())
                .data(error)
                .errorCode(error.getErrorCode())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidation(ValidationException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message(ex.getMessage())
                .errorCode(ErrorCodes.VALIDATION_ERROR.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(ex.getFieldErrors() != null ? ex.getFieldErrors() : Collections.emptyMap())
                .build();
        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message(ex.getMessage())
                .data(error)
                .errorCode(error.getErrorCode())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGeneric(Exception ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .message("Internal server error")
                .errorCode(ErrorCodes.INTERNAL_SERVER_ERROR.name())
                .timestamp(OffsetDateTime.now())
                .path(request.getRequestURI())
                .details(null)
                .build();
        ApiResponse<ErrorResponse> resp = ApiResponse.<ErrorResponse>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(error)
                .errorCode(error.getErrorCode())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
    }
}
