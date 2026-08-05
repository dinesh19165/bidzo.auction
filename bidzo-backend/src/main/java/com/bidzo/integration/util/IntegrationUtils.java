package com.bidzo.integration.util;

public final class IntegrationUtils {
    private IntegrationUtils() {}

    public static String normalizeProviderName(String name) {
        return name == null ? null : name.trim().toLowerCase();
    }

    // TODO: other helpers
}
