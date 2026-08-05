package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.PaymentCompletedEvent;

@Component
public class PaymentEventListener {

    @EventListener
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        // TODO: handle payment completed
    }
}
