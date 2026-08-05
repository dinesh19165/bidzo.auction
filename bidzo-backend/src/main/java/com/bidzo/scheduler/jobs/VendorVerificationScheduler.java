package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class VendorVerificationScheduler {

    private final SchedulerService schedulerService;

    public VendorVerificationScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.vendorVerification:0 0 7 * * *}")
    public void run() {
        // TODO: process vendor verification queue
    }
}
