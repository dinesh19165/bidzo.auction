package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class AuctionCacheManager {

    private final CacheService cacheService;

    public AuctionCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putAuction(Long id, Object auction) {
        // TODO: cache auction
        cacheService.put(CacheKeys.AUCTION, id, auction);
    }

    public <T> T getAuction(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.AUCTION, id, type);
    }

    public void evictAuction(Long id) {
        cacheService.evict(CacheKeys.AUCTION, id);
    }
}
