package com.bidzo.storage.service;

import com.bidzo.storage.dto.FileUploadRequest;
import com.bidzo.storage.dto.FileUploadResponse;
import com.bidzo.storage.dto.FileDownloadResponse;
import com.bidzo.storage.dto.FileMetadata;

import java.io.InputStream;

public interface StorageService {
    FileUploadResponse upload(FileUploadRequest request);
    FileDownloadResponse download(String key);
    FileMetadata metadata(String key);
    void delete(String key);
}
