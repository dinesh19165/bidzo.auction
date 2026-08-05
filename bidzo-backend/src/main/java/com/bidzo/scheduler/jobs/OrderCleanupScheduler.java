package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class OrderCleanupScheduler {

    private final SchedulerService schedulerService;

    public OrderCleanupScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.orderCleanup:0 0 3 * * *}")
    public void run() {
        // TODO: clean up stale or expired orders
    }
}
