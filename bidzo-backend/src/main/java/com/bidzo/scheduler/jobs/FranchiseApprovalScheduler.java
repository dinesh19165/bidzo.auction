package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class FranchiseApprovalScheduler {

    private final SchedulerService schedulerService;

    public FranchiseApprovalScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.franchiseApproval:0 0 8 * * *}")
    public void run() {
        // TODO: process franchise approvals
    }
}
