package com.bidzo.push.dto;

public class TopicResponse {
    private String topic;
    private boolean subscribed;

    public TopicResponse() {}

    public TopicResponse(String topic, boolean subscribed) {
        this.topic = topic;
        this.subscribed = subscribed;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public boolean isSubscribed() {
        return subscribed;
    }

    public void setSubscribed(boolean subscribed) {
        this.subscribed = subscribed;
    }
}
