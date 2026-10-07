package com.example.dashboard.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CacheController {

    private final CacheManager cacheManager;

    public CacheController(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @GetMapping("/cache")
    public Map<String, Object> list() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("cacheManager", cacheManager.getClass().getSimpleName());
        body.put("caches", cacheManager.getCacheNames());
        return body;
    }

    /** Clears every cache so that the next request is a cache miss again. */
    @DeleteMapping("/cache")
    public Map<String, Object> clear() {
        for (String name : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("cleared", cacheManager.getCacheNames());
        return body;
    }
}
