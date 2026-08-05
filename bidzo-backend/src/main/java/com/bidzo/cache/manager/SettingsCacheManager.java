package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class SettingsCacheManager {

    private final CacheService cacheService;

    public SettingsCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putSettings(String key, Object settings) {
        // TODO: cache settings
        cacheService.put(CacheKeys.SETTINGS, key, settings);
    }

    public <T> T getSettings(String key, Class<T> type) {
        return cacheService.get(CacheKeys.SETTINGS, key, type);
    }

    public void evictSettings(String key) {
        cacheService.evict(CacheKeys.SETTINGS, key);
    }
}
