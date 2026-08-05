package com.bidzo.push.util;

import com.bidzo.push.dto.PushRequest;

public class NotificationBuilder {
    private final PushRequest request = new PushRequest();

    public NotificationBuilder title(String title) {
        request.setTitle(title);
        return this;
    }

    public NotificationBuilder body(String body) {
        request.setBody(body);
        return this;
    }

    public NotificationBuilder target(String token) {
        request.setTargetToken(token);
        return this;
    }

    public PushRequest build() {
        return request;
    }
}
