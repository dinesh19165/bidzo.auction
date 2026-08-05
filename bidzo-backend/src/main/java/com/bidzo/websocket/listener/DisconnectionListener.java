package com.bidzo.websocket.listener;

import org.springframework.context.ApplicationListener;
import org.springframework.context.ApplicationEvent;
import org.springframework.stereotype.Component;

@Component
public class DisconnectionListener implements ApplicationListener<ApplicationEvent> {

    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        // TODO: react to disconnection-related events if published
    }
}
