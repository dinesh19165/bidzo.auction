package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class AuctionStartScheduler {

    private final SchedulerService schedulerService;

    public AuctionStartScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.auctionStart:0 0 * * * *}")
    public void run() {
        // TODO: trigger auction start tasks
    }
}
