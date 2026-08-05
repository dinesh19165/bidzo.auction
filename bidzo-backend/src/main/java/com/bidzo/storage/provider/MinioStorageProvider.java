package com.bidzo.storage.provider;

import org.springframework.stereotype.Component;
import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

@Component
public class MinioStorageProvider implements StorageProvider {

    @Override
    public FileUploadResponse upload(FileUploadRequest request) {
        // TODO: implement MinIO upload (placeholder)
        return new FileUploadResponse(null, "minio", null);
    }

    @Override
    public FileDownloadResponse download(String key) {
        // TODO: implement MinIO download
        return new FileDownloadResponse(null, null, null);
    }

    @Override
    public FileMetadata metadata(String key) {
        // TODO: implement MinIO metadata
        return new FileMetadata(key, null, null, null);
    }

    @Override
    public void delete(String key) {
        // TODO: implement MinIO delete
    }
}
