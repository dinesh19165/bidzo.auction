package com.bidzo.monitoring.health;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // TODO: implement DB health check; placeholder returns unknown
        return Health.status("UNKNOWN").withDetail("database", "not-checked").build();
    }
}
