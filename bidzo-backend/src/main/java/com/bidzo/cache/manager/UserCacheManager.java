package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class UserCacheManager {

    private final CacheService cacheService;

    public UserCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putUser(Long id, Object user) {
        // TODO: cache user object
        cacheService.put(CacheKeys.USER, id, user);
    }

    public <T> T getUser(Long id, Class<T> type) {
        // TODO: return cached user
        return cacheService.get(CacheKeys.USER, id, type);
    }

    public void evictUser(Long id) {
        cacheService.evict(CacheKeys.USER, id);
    }
}
