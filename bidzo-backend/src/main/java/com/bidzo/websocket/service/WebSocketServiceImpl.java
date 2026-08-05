package com.bidzo.websocket.service;

import org.springframework.stereotype.Service;
import com.bidzo.websocket.dto.WebSocketRequest;
import com.bidzo.websocket.dto.WebSocketResponse;

@Service
public class WebSocketServiceImpl implements WebSocketService {

    private final WebSocketSessionManager sessionManager;

    public WebSocketServiceImpl(WebSocketSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Override
    public void send(String sessionId, WebSocketResponse message) {
        // TODO: serialize and send to specific session
    }

    @Override
    public void broadcast(WebSocketResponse message) {
        // TODO: broadcast to all sessions
    }

    @Override
    public void handleIncoming(String sessionId, WebSocketRequest request) {
        // TODO: handle incoming messages
    }
}
