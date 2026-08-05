package com.bidzo.event.event;

import java.math.BigDecimal;

public record WalletDebitedEvent(Long walletId, BigDecimal amount) {}
