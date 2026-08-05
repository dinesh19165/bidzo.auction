package com.bidzo.monitoring.metrics;

import org.springframework.stereotype.Component;
import io.micrometer.core.instrument.MeterRegistry;

@Component
public class AuctionMetrics {
    private final MeterRegistry registry;

    public AuctionMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    // TODO: add auction-specific metrics (bids, active auctions, durations)
}
