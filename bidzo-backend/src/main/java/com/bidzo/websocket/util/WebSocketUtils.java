package com.bidzo.websocket.util;

import java.util.UUID;

public final class WebSocketUtils {
    private WebSocketUtils() {}

    public static String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    // TODO: add helpers for ping/pong, safe send
}
