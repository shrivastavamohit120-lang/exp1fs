package com.example.dashboard.controller;

import com.example.dashboard.service.AnalyticsService;
import com.example.dashboard.service.CachedAnalyticsService;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Assignment 5 helper - an in-process before/after caching comparison.
 * (Use the JMeter plan in /jmeter for load testing with concurrent users.)
 */
@RestController
public class BenchmarkController {

    private final AnalyticsService analyticsService;
    private final CachedAnalyticsService cachedAnalyticsService;
    private final CacheManager cacheManager;

    public BenchmarkController(AnalyticsService analyticsService,
                               CachedAnalyticsService cachedAnalyticsService,
                               CacheManager cacheManager) {
        this.analyticsService = analyticsService;
        this.cachedAnalyticsService = cachedAnalyticsService;
        this.cacheManager = cacheManager;
    }

    @GetMapping("/benchmark/analytics")
    public Map<String, Object> benchmark(@RequestParam(defaultValue = "5") int runs) {
        int n = Math.max(2, Math.min(runs, 20));

        List<Long> uncached = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            long t = System.nanoTime();
            analyticsService.computeAnalytics();
            uncached.add((System.nanoTime() - t) / 1_000_000);
        }

        Cache cache = cacheManager.getCache("analytics");
        if (cache != null) {
            cache.clear();
        }
        List<Long> cached = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            long t = System.nanoTime();
            cachedAnalyticsService.getAnalytics();   // 1st = miss, rest = hits
            cached.add((System.nanoTime() - t) / 1_000_000);
        }

        double uncachedAvg = uncached.stream().mapToLong(Long::longValue).average().orElse(0);
        double hitAvg = cached.stream().skip(1).mapToLong(Long::longValue).average().orElse(0);

        Map<String, Object> uncachedStats = new LinkedHashMap<>();
        uncachedStats.put("runsMs", uncached);
        uncachedStats.put("averageMs", round(uncachedAvg));

        Map<String, Object> cachedStats = new LinkedHashMap<>();
        cachedStats.put("runsMs", cached);
        cachedStats.put("firstCallMs (cache miss)", cached.get(0));
        cachedStats.put("averageHitMs", round(hitAvg));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("runs", n);
        body.put("withoutCache", uncachedStats);
        body.put("withCache", cachedStats);
        body.put("speedupFactor", hitAvg <= 0 ? "n/a (hits under 1 ms)" : round(uncachedAvg / hitAvg) + "x");
        return body;
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
