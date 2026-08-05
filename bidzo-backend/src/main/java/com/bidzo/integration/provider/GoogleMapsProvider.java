package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class GoogleMapsProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle Google Maps integration
        return new IntegrationResponse("NOT_IMPLEMENTED", "Google Maps provider placeholder");
    }
}
