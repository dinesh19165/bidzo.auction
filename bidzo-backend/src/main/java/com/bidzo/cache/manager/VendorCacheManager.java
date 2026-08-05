package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class VendorCacheManager {

    private final CacheService cacheService;

    public VendorCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putVendor(Long id, Object vendor) {
        // TODO: cache vendor
        cacheService.put(CacheKeys.VENDOR, id, vendor);
    }

    public <T> T getVendor(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.VENDOR, id, type);
    }

    public void evictVendor(Long id) {
        cacheService.evict(CacheKeys.VENDOR, id);
    }
}
