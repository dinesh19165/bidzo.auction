package com.bidzo.push.provider;

import org.springframework.stereotype.Component;
import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.config.PushProperties;

@Component
public class OneSignalPushProvider implements PushProvider {

    private final PushProperties properties;

    public OneSignalPushProvider(PushProperties properties) {
        this.properties = properties;
    }

    @Override
    public PushResponse send(PushRequest request) {
        // TODO: implement OneSignal push sending
        return new PushResponse(null, "NOT_IMPLEMENTED", "OneSignal provider is a placeholder");
    }
}
