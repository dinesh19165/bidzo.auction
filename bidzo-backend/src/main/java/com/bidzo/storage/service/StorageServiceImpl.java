package com.bidzo.storage.service;

import org.springframework.stereotype.Service;
import com.bidzo.storage.provider.StorageProvider;
import com.bidzo.storage.config.StorageProperties;
import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

@Service
public class StorageServiceImpl implements StorageService {

    private final StorageProvider provider;

    public StorageServiceImpl(StorageProvider provider, StorageProperties properties) {
        this.provider = provider;
        // TODO: use properties if provider selection is needed
    }

    @Override
    public FileUploadResponse upload(FileUploadRequest request) {
        // TODO: delegate to provider and return response
        return provider.upload(request);
    }

    @Override
    public FileDownloadResponse download(String key) {
        // TODO: delegate to provider
        return provider.download(key);
    }

    @Override
    public FileMetadata metadata(String key) {
        // TODO: delegate to provider
        return provider.metadata(key);
    }

    @Override
    public void delete(String key) {
        // TODO: delegate to provider
        provider.delete(key);
    }
}
