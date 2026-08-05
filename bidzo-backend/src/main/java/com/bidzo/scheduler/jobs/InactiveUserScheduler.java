package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class InactiveUserScheduler {

    private final SchedulerService schedulerService;

    public InactiveUserScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.inactiveUser:0 0 6 * * *}")
    public void run() {
        // TODO: handle inactive user cleanup or notifications
    }
}
