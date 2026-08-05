package com.bidzo.email.util;

import java.util.UUID;

public final class EmailUtils {
    private EmailUtils() {}

    public static String generateMessageId() {
        return UUID.randomUUID().toString();
    }

    // TODO: add more helpers (address validation, header builders)
}
