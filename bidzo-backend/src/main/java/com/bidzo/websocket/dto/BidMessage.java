package com.bidzo.websocket.dto;

import java.math.BigDecimal;

public class BidMessage {
    private String auctionId;
    private String userId;
    private BigDecimal amount;

    public BidMessage() {}

    public String getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(String auctionId) {
        this.auctionId = auctionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
