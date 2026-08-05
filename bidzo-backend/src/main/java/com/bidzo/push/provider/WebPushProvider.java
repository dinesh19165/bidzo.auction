package com.bidzo.push.provider;

import org.springframework.stereotype.Component;
import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.config.PushProperties;

@Component
public class WebPushProvider implements PushProvider {

    private final PushProperties properties;

    public WebPushProvider(PushProperties properties) {
        this.properties = properties;
    }

    @Override
    public PushResponse send(PushRequest request) {
        // TODO: implement Web Push sending
        return new PushResponse(null, "NOT_IMPLEMENTED", "WebPush provider is a placeholder");
    }
}
