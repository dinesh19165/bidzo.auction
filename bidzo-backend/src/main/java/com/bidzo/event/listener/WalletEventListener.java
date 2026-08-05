package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.WalletCreditedEvent;
import com.bidzo.event.event.WalletDebitedEvent;

@Component
public class WalletEventListener {

    @EventListener
    public void onWalletCredited(WalletCreditedEvent event) {
        // TODO: handle wallet credited
    }

    @EventListener
    public void onWalletDebited(WalletDebitedEvent event) {
        // TODO: handle wallet debited
    }
}
