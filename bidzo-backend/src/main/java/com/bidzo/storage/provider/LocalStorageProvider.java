package com.bidzo.storage.provider;

import org.springframework.stereotype.Component;
import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

@Component
public class LocalStorageProvider implements StorageProvider {

    @Override
    public FileUploadResponse upload(FileUploadRequest request) {
        // TODO: implement local file storage upload
        return new FileUploadResponse(null, "local", null);
    }

    @Override
    public FileDownloadResponse download(String key) {
        // TODO: implement local file download
        return new FileDownloadResponse(null, null, null);
    }

    @Override
    public FileMetadata metadata(String key) {
        // TODO: implement metadata retrieval
        return new FileMetadata(key, null, null, null);
    }

    @Override
    public void delete(String key) {
        // TODO: implement delete
    }
}
