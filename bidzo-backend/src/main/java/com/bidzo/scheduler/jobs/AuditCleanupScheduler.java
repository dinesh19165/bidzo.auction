package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class AuditCleanupScheduler {

    private final SchedulerService schedulerService;

    public AuditCleanupScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.auditCleanup:0 0 5 * * *}")
    public void run() {
        // TODO: purge old audit logs
    }
}
