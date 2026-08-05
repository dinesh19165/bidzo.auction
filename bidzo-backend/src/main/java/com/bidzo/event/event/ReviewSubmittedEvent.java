package com.bidzo.event.event;

public record ReviewSubmittedEvent(Long reviewId, Long productId, Long userId) {}
