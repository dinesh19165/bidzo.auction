package com.bidzo.integration.provider;

import org.springframework.stereotype.Component;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;

@Component
public class CloudStorageProvider implements IntegrationProvider {

    @Override
    public IntegrationResponse handle(IntegrationRequest request) {
        // TODO: handle cloud storage interactions
        return new IntegrationResponse("NOT_IMPLEMENTED", "Cloud Storage provider placeholder");
    }
}
