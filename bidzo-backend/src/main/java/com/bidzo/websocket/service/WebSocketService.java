package com.bidzo.websocket.service;

import com.bidzo.websocket.dto.WebSocketRequest;
import com.bidzo.websocket.dto.WebSocketResponse;

public interface WebSocketService {
    void send(String sessionId, WebSocketResponse message);
    void broadcast(WebSocketResponse message);
    void handleIncoming(String sessionId, WebSocketRequest request);
}
