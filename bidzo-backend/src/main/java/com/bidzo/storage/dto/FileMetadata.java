package com.bidzo.storage.dto;

import java.time.Instant;

public class FileMetadata {
    private String key;
    private String filename;
    private String contentType;
    private Instant createdAt;

    public FileMetadata() {}

    public FileMetadata(String key, String filename, String contentType, Instant createdAt) {
        this.key = key;
        this.filename = filename;
        this.contentType = contentType;
        this.createdAt = createdAt;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
