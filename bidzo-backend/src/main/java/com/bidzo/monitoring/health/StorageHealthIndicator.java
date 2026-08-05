package com.bidzo.monitoring.health;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class StorageHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // TODO: implement storage health check
        return Health.status("UNKNOWN").withDetail("storage", "not-checked").build();
    }
}
