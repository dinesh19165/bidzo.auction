package com.bidzo.sms.util;

import java.util.UUID;

public final class SmsUtils {
    private SmsUtils() {}

    public static String generateMessageId() {
        return UUID.randomUUID().toString();
    }

    // TODO: add phone number normalization/validation helpers
}
