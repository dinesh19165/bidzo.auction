package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class PaymentExpiryScheduler {

    private final SchedulerService schedulerService;

    public PaymentExpiryScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.paymentExpiry:0 0 1 * * *}")
    public void run() {
        // TODO: handle payment expiries
    }
}
