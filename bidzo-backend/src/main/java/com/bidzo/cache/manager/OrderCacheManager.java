package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class OrderCacheManager {

    private final CacheService cacheService;

    public OrderCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putOrder(Long id, Object order) {
        // TODO: cache order
        cacheService.put(CacheKeys.ORDER, id, order);
    }

    public <T> T getOrder(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.ORDER, id, type);
    }

    public void evictOrder(Long id) {
        cacheService.evict(CacheKeys.ORDER, id);
    }
}
