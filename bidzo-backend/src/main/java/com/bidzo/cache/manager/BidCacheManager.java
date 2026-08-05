package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class BidCacheManager {

    private final CacheService cacheService;

    public BidCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putBid(Long id, Object bid) {
        // TODO: cache bid
        cacheService.put(CacheKeys.BID, id, bid);
    }

    public <T> T getBid(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.BID, id, type);
    }

    public void evictBid(Long id) {
        cacheService.evict(CacheKeys.BID, id);
    }
}
