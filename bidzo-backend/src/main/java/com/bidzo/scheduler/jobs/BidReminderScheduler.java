package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class BidReminderScheduler {

    private final SchedulerService schedulerService;

    public BidReminderScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.bidReminder:0 0/30 * * * *}")
    public void run() {
        // TODO: send reminders to bidders about active auctions
    }
}
