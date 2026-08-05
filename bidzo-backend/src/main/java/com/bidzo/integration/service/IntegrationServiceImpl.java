package com.bidzo.integration.service;

import org.springframework.stereotype.Service;
import com.bidzo.integration.provider.IntegrationProvider;
import com.bidzo.integration.config.IntegrationProperties;
import com.bidzo.integration.dto.IntegrationRequest;
import com.bidzo.integration.dto.IntegrationResponse;
import com.bidzo.integration.dto.AddressValidationRequest;
import com.bidzo.integration.dto.AddressValidationResponse;
import com.bidzo.integration.dto.GSTVerificationRequest;
import com.bidzo.integration.dto.GSTVerificationResponse;
import com.bidzo.integration.dto.PANVerificationRequest;
import com.bidzo.integration.dto.PANVerificationResponse;
import com.bidzo.integration.dto.AadhaarVerificationRequest;
import com.bidzo.integration.dto.AadhaarVerificationResponse;
import com.bidzo.integration.dto.GeoLocationRequest;
import com.bidzo.integration.dto.GeoLocationResponse;

@Service
public class IntegrationServiceImpl implements IntegrationService {

    private final IntegrationProvider provider;
    private final IntegrationProperties properties;

    public IntegrationServiceImpl(IntegrationProvider provider, IntegrationProperties properties) {
        this.provider = provider;
        this.properties = properties;
    }

    @Override
    public IntegrationResponse call(IntegrationRequest request) {
        // TODO: choose provider/route and delegate
        return provider.handle(request);
    }

    @Override
    public AddressValidationResponse validateAddress(AddressValidationRequest request) {
        // TODO: delegate to provider or specific client
        return new AddressValidationResponse(false, "Not implemented");
    }

    @Override
    public GSTVerificationResponse verifyGST(GSTVerificationRequest request) {
        // TODO: delegate
        return new GSTVerificationResponse(false, "Not implemented");
    }

    @Override
    public PANVerificationResponse verifyPAN(PANVerificationRequest request) {
        // TODO: delegate
        return new PANVerificationResponse(false, "Not implemented");
    }

    @Override
    public AadhaarVerificationResponse verifyAadhaar(AadhaarVerificationRequest request) {
        // TODO: delegate
        return new AadhaarVerificationResponse(false, "Not implemented");
    }

    @Override
    public GeoLocationResponse geoLocate(GeoLocationRequest request) {
        // TODO: delegate to GoogleMaps client
        return new GeoLocationResponse(null, null);
    }
}
