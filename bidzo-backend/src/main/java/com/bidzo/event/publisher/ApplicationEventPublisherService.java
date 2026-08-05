package com.bidzo.event.publisher;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class ApplicationEventPublisherService {

    private final ApplicationEventPublisher publisher;

    public ApplicationEventPublisherService(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publish(Object event) {
        publisher.publishEvent(event);
    }
}
