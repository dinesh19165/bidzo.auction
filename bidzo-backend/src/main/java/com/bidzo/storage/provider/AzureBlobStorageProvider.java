package com.bidzo.storage.provider;

import org.springframework.stereotype.Component;
import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

@Component
public class AzureBlobStorageProvider implements StorageProvider {

    @Override
    public FileUploadResponse upload(FileUploadRequest request) {
        // TODO: implement Azure Blob upload (placeholder)
        return new FileUploadResponse(null, "azure", null);
    }

    @Override
    public FileDownloadResponse download(String key) {
        // TODO: implement Azure Blob download
        return new FileDownloadResponse(null, null, null);
    }

    @Override
    public FileMetadata metadata(String key) {
        // TODO: implement Azure Blob metadata
        return new FileMetadata(key, null, null, null);
    }

    @Override
    public void delete(String key) {
        // TODO: implement Azure Blob delete
    }
}
