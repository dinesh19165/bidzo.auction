package com.bidzo.monitoring.metrics;

import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class ApplicationMetrics {
    private final MeterRegistry registry;

    public ApplicationMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // TODO: expose application-level counters/gauges/timers
}
