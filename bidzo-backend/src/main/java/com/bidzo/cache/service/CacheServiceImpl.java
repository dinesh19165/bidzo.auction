package com.bidzo.cache.service;

import org.springframework.stereotype.Service;
import org.springframework.cache.CacheManager;
import org.springframework.cache.Cache;

@Service
public class CacheServiceImpl implements CacheService {

    private final CacheManager cacheManager;

    public CacheServiceImpl(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Override
    public <T> T get(String cacheName, Object key, Class<T> type) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) return null;
        Cache.ValueWrapper wrapper = cache.get(key);
        if (wrapper == null) return null;
        Object val = wrapper.get();
        // TODO: additional conversion or null handling if required
        return type.cast(val);
    }

    @Override
    public void put(String cacheName, Object key, Object value) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) return;
        cache.put(key, value);
        // TODO: add logging or metrics if needed
    }

    @Override
    public void evict(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) return;
        cache.evict(key);
        // TODO: add logging if required
    }

    @Override
    public void clear(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) return;
        cache.clear();
        // TODO: more graceful clearing strategies
    }
}
