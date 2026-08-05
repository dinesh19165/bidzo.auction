package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class PaymentGatewayProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle Payment gateway interactions
        return new IntegrationResponse("NOT_IMPLEMENTED", "Payment Gateway provider placeholder");
    }
}
