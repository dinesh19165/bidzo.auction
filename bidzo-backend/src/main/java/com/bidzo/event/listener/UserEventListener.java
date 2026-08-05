package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.UserRegisteredEvent;
import com.bidzo.event.event.CustomerRegisteredEvent;

@Component
public class UserEventListener {

    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        // TODO: handle user registered event
    }

    @EventListener
    public void onCustomerRegistered(CustomerRegisteredEvent event) {
        // TODO: handle customer registered event
    }
}
