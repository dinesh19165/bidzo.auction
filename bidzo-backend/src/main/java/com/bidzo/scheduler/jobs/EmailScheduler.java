package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class EmailScheduler {

    private final SchedulerService schedulerService;

    public EmailScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.email:0 0/10 * * * *}")
    public void run() {
        // TODO: process outgoing email queue
    }
}
