package com.bidzo.integration.service;

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

public interface IntegrationService {
    IntegrationResponse call(IntegrationRequest request);
    AddressValidationResponse validateAddress(AddressValidationRequest request);
    GSTVerificationResponse verifyGST(GSTVerificationRequest request);
    PANVerificationResponse verifyPAN(PANVerificationRequest request);
    AadhaarVerificationResponse verifyAadhaar(AadhaarVerificationRequest request);
    GeoLocationResponse geoLocate(GeoLocationRequest request);
}
