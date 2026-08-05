package com.bidzo.push.service;

import org.springframework.stereotype.Service;
import com.bidzo.push.provider.PushProvider;
import com.bidzo.push.config.PushProperties;
import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.dto.DeviceTokenRequest;
import com.bidzo.push.dto.DeviceTokenResponse;
import com.bidzo.push.dto.TopicRequest;
import com.bidzo.push.dto.TopicResponse;
import com.bidzo.push.util.NotificationBuilder;

@Service
public class PushNotificationServiceImpl implements PushNotificationService {

    private final PushProvider provider;
    private final PushProperties properties;
    private final NotificationBuilder builder;

    public PushNotificationServiceImpl(PushProvider provider, PushProperties properties, NotificationBuilder builder) {
        this.provider = provider;
        this.properties = properties;
        this.builder = builder;
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
