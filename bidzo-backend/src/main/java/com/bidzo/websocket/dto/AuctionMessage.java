package com.bidzo.websocket.dto;

public class AuctionMessage {
    private String auctionId;
    private String status;

    public AuctionMessage() {}

    public String getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(String auctionId) {
        this.auctionId = auctionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
