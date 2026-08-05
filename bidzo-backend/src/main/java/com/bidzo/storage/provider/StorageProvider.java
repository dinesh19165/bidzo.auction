package com.bidzo.storage.provider;

import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

public interface StorageProvider {
    FileUploadResponse upload(FileUploadRequest request);
    FileDownloadResponse download(String key);
    FileMetadata metadata(String key);
    void delete(String key);
}
