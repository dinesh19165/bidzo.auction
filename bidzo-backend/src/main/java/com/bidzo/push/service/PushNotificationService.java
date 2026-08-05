package com.bidzo.push.service;

import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;
import com.bidzo.push.dto.DeviceTokenRequest;
import com.bidzo.push.dto.DeviceTokenResponse;
import com.bidzo.push.dto.TopicRequest;
import com.bidzo.push.dto.TopicResponse;

public interface PushNotificationService {
    PushResponse send(PushRequest request);
    DeviceTokenResponse registerDeviceToken(DeviceTokenRequest request);
    TopicResponse subscribeToTopic(TopicRequest request);
}
