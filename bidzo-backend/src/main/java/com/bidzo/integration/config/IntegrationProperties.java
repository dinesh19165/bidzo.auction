package com.bidzo.integration.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integration")
public class IntegrationProperties {
    private String provider = "google-maps";
    private String googleMapsApiKey;
    private String gstServiceUrl;
    private String aadhaarServiceUrl;
    private String panServiceUrl;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getGoogleMapsApiKey() {
        return googleMapsApiKey;
    }

    public void setGoogleMapsApiKey(String googleMapsApiKey) {
        this.googleMapsApiKey = googleMapsApiKey;
    }

    public String getGstServiceUrl() {
        return gstServiceUrl;
    }

    public void setGstServiceUrl(String gstServiceUrl) {
        this.gstServiceUrl = gstServiceUrl;
    }

    public String getAadhaarServiceUrl() {
        return aadhaarServiceUrl;
    }

    public void setAadhaarServiceUrl(String aadhaarServiceUrl) {
        this.aadhaarServiceUrl = aadhaarServiceUrl;
    }

    public String getPanServiceUrl() {
        return panServiceUrl;
    }

    public void setPanServiceUrl(String panServiceUrl) {
        this.panServiceUrl = panServiceUrl;
    }
}
