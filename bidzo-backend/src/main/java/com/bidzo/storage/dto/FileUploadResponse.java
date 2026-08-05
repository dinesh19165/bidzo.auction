package com.bidzo.storage.dto;

public class FileUploadResponse {
    private String key;
    private String provider;
    private String url;

    public FileUploadResponse() {}

    public FileUploadResponse(String key, String provider, String url) {
        this.key = key;
        this.provider = provider;
        this.url = url;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
