package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class CategoryCacheManager {

    private final CacheService cacheService;

    public CategoryCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putCategory(Long id, Object category) {
        // TODO: cache category
        cacheService.put(CacheKeys.CATEGORY, id, category);
    }

    public <T> T getCategory(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.CATEGORY, id, type);
    }

    public void evictCategory(Long id) {
        cacheService.evict(CacheKeys.CATEGORY, id);
    }
}
