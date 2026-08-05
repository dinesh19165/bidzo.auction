package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class NotificationCacheManager {

    private final CacheService cacheService;

    public NotificationCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putNotification(Long id, Object notification) {
        // TODO: cache notification
        cacheService.put(CacheKeys.NOTIFICATION, id, notification);
    }

    public <T> T getNotification(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.NOTIFICATION, id, type);
    }

    public void evictNotification(Long id) {
        cacheService.evict(CacheKeys.NOTIFICATION, id);
    }
}
