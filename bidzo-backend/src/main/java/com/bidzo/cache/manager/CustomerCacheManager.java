package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class CustomerCacheManager {

    private final CacheService cacheService;

    public CustomerCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putCustomer(Long id, Object customer) {
        // TODO: cache customer
        cacheService.put(CacheKeys.CUSTOMER, id, customer);
    }

    public <T> T getCustomer(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.CUSTOMER, id, type);
    }

    public void evictCustomer(Long id) {
        cacheService.evict(CacheKeys.CUSTOMER, id);
    }
}
