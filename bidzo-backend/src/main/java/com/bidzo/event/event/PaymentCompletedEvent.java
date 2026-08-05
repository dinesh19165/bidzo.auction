package com.bidzo.event.event;

public record PaymentCompletedEvent(Long paymentId, Long orderId) {}
