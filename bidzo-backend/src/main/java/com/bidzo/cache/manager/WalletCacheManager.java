package com.bidzo.cache.manager;

import org.springframework.stereotype.Component;
import com.bidzo.cache.service.CacheService;
import com.bidzo.cache.key.CacheKeys;

@Component
public class WalletCacheManager {

    private final CacheService cacheService;

    public WalletCacheManager(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void putWallet(Long id, Object wallet) {
        // TODO: cache wallet
        cacheService.put(CacheKeys.WALLET, id, wallet);
    }

    public <T> T getWallet(Long id, Class<T> type) {
        return cacheService.get(CacheKeys.WALLET, id, type);
    }

    public void evictWallet(Long id) {
        cacheService.evict(CacheKeys.WALLET, id);
    }
}
