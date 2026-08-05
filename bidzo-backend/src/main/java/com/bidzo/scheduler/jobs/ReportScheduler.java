package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class ReportScheduler {

    private final SchedulerService schedulerService;

    public ReportScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.report:0 0 4 * * *}")
    public void run() {
        // TODO: generate scheduled reports
    }
}
