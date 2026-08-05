package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class GSTProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle GST verification
        return new IntegrationResponse("NOT_IMPLEMENTED", "GST provider placeholder");
    }
}
