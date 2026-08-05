package com.bidzo.monitoring.metrics;

import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class UserMetrics {
    private final MeterRegistry registry;

    public UserMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // TODO: add user-related metrics (registrations, logins, active users)
}
