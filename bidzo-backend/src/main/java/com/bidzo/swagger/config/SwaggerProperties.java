package com.bidzo.swagger.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "bidzo.swagger")
public class SwaggerProperties {
    private String title = "Bidzo API";
    private String description = "API documentation for Bidzo";
    private String version = "0.0.1";
    private String serverUrl = "http://localhost:8080";
    private String jwtSchemeName = "bearer-jwt";
    private String contactName;
    private String contactEmail;
    private String contactUrl;
    private String licenseName;
    private String licenseUrl;
    private List<String> tags;

    public SwaggerProperties() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getServerUrl() { return serverUrl; }
    public void setServerUrl(String serverUrl) { this.serverUrl = serverUrl; }
    public String getJwtSchemeName() { return jwtSchemeName; }
    public void setJwtSchemeName(String jwtSchemeName) { this.jwtSchemeName = jwtSchemeName; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactUrl() { return contactUrl; }
    public void setContactUrl(String contactUrl) { this.contactUrl = contactUrl; }
    public String getLicenseName() { return licenseName; }
    public void setLicenseName(String licenseName) { this.licenseName = licenseName; }
    public String getLicenseUrl() { return licenseUrl; }
    public void setLicenseUrl(String licenseUrl) { this.licenseUrl = licenseUrl; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
