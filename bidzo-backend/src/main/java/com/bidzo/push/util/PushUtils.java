package com.bidzo.push.util;

import java.util.UUID;

public final class PushUtils {
    private PushUtils() {}

    public static String generateMessageId() {
        return UUID.randomUUID().toString();
    }

    // TODO: add helpers for payload normalization, priority mapping
}
