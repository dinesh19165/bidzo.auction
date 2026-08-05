package com.bidzo.monitoring.metrics;

import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class CacheMetrics {
    private final MeterRegistry registry;

    public CacheMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // TODO: add cache hit/miss metrics
}
