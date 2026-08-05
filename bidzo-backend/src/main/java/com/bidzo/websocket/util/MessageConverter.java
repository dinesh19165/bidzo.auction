package com.bidzo.websocket.util;

public final class MessageConverter {
    private MessageConverter() {}

    public static String toPayload(Object dto) {
        // TODO: replace with JSON serialization
        return dto == null ? "" : dto.toString();
    }

    public static <T> T fromPayload(String payload, Class<T> clazz) {
        // TODO: replace with JSON deserialization
        return null;
    }
}
