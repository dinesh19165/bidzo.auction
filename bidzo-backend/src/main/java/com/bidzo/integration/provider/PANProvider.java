package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class PANProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle PAN verification
        return new IntegrationResponse("NOT_IMPLEMENTED", "PAN provider placeholder");
    }
}
