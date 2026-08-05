package com.bidzo.event.event;

public record BidPlacedEvent(Long bidId, Long auctionId, Long userId) {}
