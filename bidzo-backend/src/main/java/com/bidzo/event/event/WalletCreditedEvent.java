package com.bidzo.event.event;

import java.math.BigDecimal;

public record WalletCreditedEvent(Long walletId, BigDecimal amount) {}
