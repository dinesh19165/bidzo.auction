package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.VendorRegisteredEvent;
import com.bidzo.event.event.VendorApprovedEvent;

@Component
public class VendorEventListener {

    @EventListener
    public void onVendorRegistered(VendorRegisteredEvent event) {
        // TODO: handle vendor registered event
    }

    @EventListener
    public void onVendorApproved(VendorApprovedEvent event) {
        // TODO: handle vendor approved event
    }
}
