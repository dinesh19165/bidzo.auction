package com.bidzo.constants;

/**
 * Application-level constants used across modules.
 */
public final class AppConstants {
    private AppConstants() {}

    public static final String DEFAULT_TIME_ZONE = "UTC";
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX"; // ISO_OFFSET_DATE_TIME

    // common header names
    public static final String HEADER_REQUEST_ID = "X-Request-Id";
    public static final String HEADER_CORRELATION_ID = "X-Correlation-Id";
}
