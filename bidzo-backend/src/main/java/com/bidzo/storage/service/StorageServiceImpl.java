package com.bidzo.storage.service;

import java.util.Map;

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

    public StorageServiceImpl(Map<String, StorageProvider> providers, StorageProperties properties) {
        // choose provider based on configuration
        String configured = properties != null ? properties.getProvider() : null;
        StorageProvider selected = null;
        if (configured != null) {
            String beanName = configured + "StorageProvider"; // e.g. "local" -> "localStorageProvider"
            selected = providers.get(beanName);
        }

        if (selected == null) {
            selected = providers.get("localStorageProvider");
        }

        if (selected == null) {
            selected = providers.values().stream().findFirst().orElse(null);
        }

        if (selected == null) {
            throw new IllegalStateException("No StorageProvider beans available");
        }

        this.provider = selected;
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
