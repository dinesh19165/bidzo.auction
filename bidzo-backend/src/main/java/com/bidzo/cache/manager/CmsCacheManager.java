package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class CmsCacheManager {

    private final CacheService cacheService;

    public CmsCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putCms(Long id, Object cms) {
        // TODO: cache CMS data
        cacheService.put(CacheKeys.CMS, id, cms);
    }

    public <T> T getCms(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.CMS, id, type);
    }

    public void evictCms(Long id) {
        cacheService.evict(CacheKeys.CMS, id);
    }
}
