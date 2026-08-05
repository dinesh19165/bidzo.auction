package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class ProductCacheManager {

    private final CacheService cacheService;

    public ProductCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putProduct(Long id, Object product) {
        // TODO: cache product
        cacheService.put(CacheKeys.PRODUCT, id, product);
    }

    public <T> T getProduct(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.PRODUCT, id, type);
    }

    public void evictProduct(Long id) {
        cacheService.evict(CacheKeys.PRODUCT, id);
    }
}
