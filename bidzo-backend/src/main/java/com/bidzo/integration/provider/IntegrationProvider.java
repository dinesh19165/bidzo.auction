package com.bidzo.integration.provider;

import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

public interface IntegrationProvider {
    IntegrationResponse handle(IntegrationRequest request);
}
