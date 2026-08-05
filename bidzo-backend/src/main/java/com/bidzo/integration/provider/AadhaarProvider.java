package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class AadhaarProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle Aadhaar verification
        return new IntegrationResponse("NOT_IMPLEMENTED", "Aadhaar provider placeholder");
    }
}
