package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.OrderCreatedEvent;
import com.bidzo.event.event.OrderCancelledEvent;
import com.bidzo.event.event.OrderDeliveredEvent;

@Component
public class OrderEventListener {

    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        // TODO: handle order created
    }

    @EventListener
    public void onOrderCancelled(OrderCancelledEvent event) {
        // TODO: handle order cancelled
    }

    @EventListener
    public void onOrderDelivered(OrderDeliveredEvent event) {
        // TODO: handle order delivered
    }
}
