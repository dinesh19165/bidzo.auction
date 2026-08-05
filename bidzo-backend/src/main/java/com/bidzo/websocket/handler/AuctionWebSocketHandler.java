package com.bidzo.websocket.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.CloseStatus;
import com.bidzo.websocket.service.WebSocketSessionManager;

@Component
public class AuctionWebSocketHandler extends TextWebSocketHandler {

    private final WebSocketSessionManager sessionManager;

    public AuctionWebSocketHandler(WebSocketSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessionManager.addSession(session.getId(), session);
        // TODO: handle connection established
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // TODO: handle incoming auction messages
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessionManager.removeSession(session.getId());
        // TODO: handle cleanup
    }
}
