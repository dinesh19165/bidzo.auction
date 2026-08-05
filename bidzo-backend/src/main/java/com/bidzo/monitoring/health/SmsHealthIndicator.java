package com.bidzo.monitoring.health;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class SmsHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // TODO: implement SMS provider health check
        return Health.status("UNKNOWN").withDetail("sms", "not-checked").build();
    }
}
