package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class SMSGatewayProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle SMS gateway interactions
        return new IntegrationResponse("NOT_IMPLEMENTED", "SMS Gateway provider placeholder");
    }
}
