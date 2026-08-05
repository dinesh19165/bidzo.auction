package com.bidzo.websocket.listener;

import org.springframework.context.ApplicationListener;
import org.springframework.context.ApplicationEvent;
import org.springframework.stereotype.Component;

@Component
public class ConnectionListener implements ApplicationListener<ApplicationEvent> {

    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        // TODO: react to connection-related events if published
    }
}
