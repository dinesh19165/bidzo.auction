package com.bidzo.cache.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.CacheManager;
import com.bidzo.cache.key.CacheKeys;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Redis-ready: replace with RedisCacheManager when Redis dependency is added
        return new ConcurrentMapCacheManager(CacheKeys.USER, CacheKeys.CUSTOMER, CacheKeys.VENDOR,
                CacheKeys.PRODUCT, CacheKeys.CATEGORY, CacheKeys.AUCTION, CacheKeys.BID, CacheKeys.ORDER,
                CacheKeys.WALLET, CacheKeys.NOTIFICATION, CacheKeys.CMS, CacheKeys.SETTINGS);
    }
}
