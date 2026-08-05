package com.bidzo.scheduler.jobs;

import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import com.bidzo.scheduler.service.SchedulerService;

@Component
public class WalletSettlementScheduler {

    private final SchedulerService schedulerService;

    public WalletSettlementScheduler(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(cron = "${scheduler.cron.walletSettlement:0 0 2 * * *}")
    public void run() {
        // TODO: perform wallet settlement tasks
    }
}
