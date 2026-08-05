package com.bidzo.cache.service;

public interface CacheService {
    <T> T get(String cacheName, Object key, Class<T> type);
    void put(String cacheName, Object key, Object value);
    void evict(String cacheName, Object key);
    void clear(String cacheName);
}
