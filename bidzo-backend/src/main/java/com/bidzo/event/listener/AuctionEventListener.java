package com.bidzo.event.listener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import com.bidzo.event.event.AuctionCreatedEvent;
import com.bidzo.event.event.AuctionStartedEvent;
import com.bidzo.event.event.AuctionEndedEvent;
import com.bidzo.event.event.BidPlacedEvent;
import com.bidzo.event.event.BidWonEvent;

@Component
public class AuctionEventListener {

    @EventListener
    public void onAuctionCreated(AuctionCreatedEvent event) {
        // TODO: handle auction created
    }

    @EventListener
    public void onAuctionStarted(AuctionStartedEvent event) {
        // TODO: handle auction started
    }

    @EventListener
    public void onAuctionEnded(AuctionEndedEvent event) {
        // TODO: handle auction ended
    }

    @EventListener
    public void onBidPlaced(BidPlacedEvent event) {
        // TODO: handle bid placed
    }

    @EventListener
    public void onBidWon(BidWonEvent event) {
        // TODO: handle bid won
    }
}
