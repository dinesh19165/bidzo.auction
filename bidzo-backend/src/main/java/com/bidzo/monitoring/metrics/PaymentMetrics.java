package com.bidzo.monitoring.metrics;

import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class PaymentMetrics {
    private final MeterRegistry registry;

    public PaymentMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // TODO: add payment processing metrics (success/failure counters, latencies)
}
