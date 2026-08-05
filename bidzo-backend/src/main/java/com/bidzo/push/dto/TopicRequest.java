package com.bidzo.push.dto;

public class TopicRequest {
    private String topic;
    private String deviceToken;

    public TopicRequest() {}

    public TopicRequest(String topic, String deviceToken) {
        this.topic = topic;
        this.deviceToken = deviceToken;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDeviceToken() {
        return deviceToken;
    }

    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }
}
