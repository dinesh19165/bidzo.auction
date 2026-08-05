package com.bidzo.storage.provider;

import org.springframework.stereotype.Component;
import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

@Component
public class S3StorageProvider implements StorageProvider {

    @Override
    public FileUploadResponse upload(FileUploadRequest request) {
        // TODO: implement S3 upload (placeholder)
        return new FileUploadResponse(null, "s3", null);
    }

    @Override
    public FileDownloadResponse download(String key) {
        // TODO: implement S3 download (placeholder)
        return new FileDownloadResponse(null, null, null);
    }

    @Override
    public FileMetadata metadata(String key) {
        // TODO: implement S3 metadata retrieval
        return new FileMetadata(key, null, null, null);
    }

    @Override
    public void delete(String key) {
        // TODO: implement S3 delete
    }
}
