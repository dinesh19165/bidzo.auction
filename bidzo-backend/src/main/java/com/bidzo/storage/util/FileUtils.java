package com.bidzo.storage.util;

import java.util.UUID;

public final class FileUtils {
    private FileUtils() {}

    public static String generateKey(String filename) {
        return UUID.randomUUID().toString() + "-" + filename;
    }

    // TODO: add more helpers (extension extraction, validation, size checks)
}
