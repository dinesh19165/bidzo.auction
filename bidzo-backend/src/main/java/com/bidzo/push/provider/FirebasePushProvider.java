package com.bidzo.push.provider;

import org.springframework.stereotype.Component;
import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.config.PushProperties;

@Component
public class FirebasePushProvider implements PushProvider {

    private final PushProperties properties;

    public FirebasePushProvider(PushProperties properties) {
        this.properties = properties;
    }

    @Override
    public PushResponse send(PushRequest request) {
        // TODO: implement Firebase push sending
        return new PushResponse(null, "NOT_IMPLEMENTED", "Firebase provider is a placeholder");
    }
}
