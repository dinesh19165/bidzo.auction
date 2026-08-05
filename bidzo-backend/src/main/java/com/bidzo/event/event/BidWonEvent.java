package com.bidzo.event.event;

public record BidWonEvent(Long bidId, Long auctionId, Long winnerUserId) {}
