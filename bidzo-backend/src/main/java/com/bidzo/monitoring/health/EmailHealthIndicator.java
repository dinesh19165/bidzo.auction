package com.bidzo.monitoring.health;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class EmailHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // TODO: implement email provider health check
        return Health.status("UNKNOWN").withDetail("email", "not-checked").build();
    }
}
