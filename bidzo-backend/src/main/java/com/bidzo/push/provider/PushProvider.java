package com.bidzo.push.provider;

import com.bidzo.push.dto.PushRequest;
import com.bidzo.push.dto.PushResponse;

public interface PushProvider {
    PushResponse send(PushRequest request);
}
