package com.bidzo.storage.util;

public final class ImageUtils {
    private ImageUtils() {}

    public static boolean isImage(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }

    // TODO: add image resizing, thumbnail generation helpers
}
