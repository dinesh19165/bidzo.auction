package com.bidzo.monitoring.health;

import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.stereotype.Component;

@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // TODO: implement payment gateway health check
        return Health.status("UNKNOWN").withDetail("paymentGateway", "not-checked").build();
    }
}
