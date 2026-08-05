package com.bidzo.util;

import com.bidzo.constants.AppConstants;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * Date/time helper utilities.
 */
public final class DateUtils {
    private static final ZoneId ZONE = ZoneId.of(AppConstants.DEFAULT_TIME_ZONE);
    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private DateUtils() {}

    public static OffsetDateTime now() {
        return OffsetDateTime.now(ZONE);
    }

    public static String toIsoString(OffsetDateTime dt) {
        if (Objects.isNull(dt)) return null;
        return dt.format(ISO_FMT);
    }

    public static OffsetDateTime parseIso(String s) {
        if (s == null || s.isBlank()) return null;
        return OffsetDateTime.parse(s, ISO_FMT);
    }
}
