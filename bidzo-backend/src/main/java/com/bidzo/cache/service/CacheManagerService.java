package com.bidzo.cache.service;

import org.springframework.stereotype.Service;
import org.springframework.cache.CacheManager;

@Service
public class CacheManagerService {

    private final CacheManager cacheManager;

    public CacheManagerService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    public CacheManager getCacheManager() {
        return cacheManager;
    }

    // TODO: add management operations like evictAll, refresh cache statistics, etc.
}
