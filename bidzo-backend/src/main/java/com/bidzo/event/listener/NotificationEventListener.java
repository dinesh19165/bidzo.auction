package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.NotificationCreatedEvent;
import com.bidzo.event.event.ReviewSubmittedEvent;

@Component
public class NotificationEventListener {

    @EventListener
    public void onNotificationCreated(NotificationCreatedEvent event) {
        // TODO: handle notification created
    }

    @EventListener
    public void onReviewSubmitted(ReviewSubmittedEvent event) {
        // TODO: handle review submitted (e.g., notify vendor)
    }
}
