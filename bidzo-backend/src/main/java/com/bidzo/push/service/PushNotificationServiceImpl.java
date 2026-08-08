package com.bidzo.push.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import com.bidzo.push.provider.PushProvider;
import com.bidzo.push.config.PushProperties;
import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.dto.DeviceTokenRequest;
import com.bidzo.push.dto.DeviceTokenResponse;
import com.bidzo.push.dto.TopicRequest;
import com.bidzo.push.dto.TopicResponse;

@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private final PushProvider provider;
    private final PushProperties properties;

    public PushNotificationServiceImpl(Map<String, PushProvider> providers, PushProperties properties) {
        this.properties = properties;

        String configured = properties != null ? properties.getProvider() : null;
        PushProvider selected = null;
        if (configured != null) {
            String beanName = configured + "PushProvider"; // e.g. "firebase" -> "firebasePushProvider"
            selected = providers.get(beanName);
        }

        if (selected == null) {
            selected = providers.get("firebasePushProvider");
        }

        if (selected == null) {
            selected = providers.values().stream().findFirst().orElse(null);
        }

        if (selected == null) {
            throw new IllegalStateException("No PushProvider beans available");
        }

        this.provider = selected;
    }

    @Override
    public PushResponse send(PushRequest request) {
        // TODO: validate, build notification, delegate to provider
        return provider.send(request);
    }

    @Override
    public DeviceTokenResponse registerDeviceToken(DeviceTokenRequest request) {
        // TODO: register device token (no repository calls here)
        return new DeviceTokenResponse(request.getDeviceToken(), true);
    }

    @Override
    public TopicResponse subscribeToTopic(TopicRequest request) {
        // TODO: subscribe device to topic (no repository calls)
        return new TopicResponse(request.getTopic(), true);
    }
}
