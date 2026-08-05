package com.bidzo.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.bidzo.websocket.handler.AuctionWebSocketHandler;
import com.bidzo.websocket.handler.BidWebSocketHandler;
import com.bidzo.websocket.handler.NotificationWebSocketHandler;
import com.bidzo.websocket.handler.ChatWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final AuctionWebSocketHandler auctionHandler;
    private final BidWebSocketHandler bidHandler;
    private final NotificationWebSocketHandler notificationHandler;
    private final ChatWebSocketHandler chatHandler;

    public WebSocketConfig(AuctionWebSocketHandler auctionHandler,
                           BidWebSocketHandler bidHandler,
                           NotificationWebSocketHandler notificationHandler,
                           ChatWebSocketHandler chatHandler) {
        this.auctionHandler = auctionHandler;
        this.bidHandler = bidHandler;
        this.notificationHandler = notificationHandler;
        this.chatHandler = chatHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register handlers with simple endpoints. TODO: secure and configure origins
        registry.addHandler(auctionHandler, "/ws/auction").setAllowedOrigins("*");
        registry.addHandler(bidHandler, "/ws/bid").setAllowedOrigins("*");
        registry.addHandler(notificationHandler, "/ws/notification").setAllowedOrigins("*");
        registry.addHandler(chatHandler, "/ws/chat").setAllowedOrigins("*");
    }
}
