package com.example.dashboard.controller;

import com.example.dashboard.dto.AnalyticsDto;
import com.example.dashboard.service.AnalyticsService;
import com.example.dashboard.service.CachedAnalyticsService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalyticsController {

    private final CachedAnalyticsService cachedAnalyticsService;
    private final AnalyticsService analyticsService;

    public AnalyticsController(CachedAnalyticsService cachedAnalyticsService, AnalyticsService analyticsService) {
        this.cachedAnalyticsService = cachedAnalyticsService;
        this.analyticsService = analyticsService;
    }

    /** Assignment 3 - cached analytics. First call is slow (cache miss), later calls are fast. */
    @GetMapping("/analytics")
    public Map<String, Object> cached() {
        long start = System.nanoTime();
        AnalyticsDto data = cachedAnalyticsService.getAnalytics();
        return wrap("cached (Ehcache)", start, data);
    }

    /** Same data without the cache - used as the "before caching" baseline. */
    @GetMapping("/analytics/uncached")
    public Map<String, Object> uncached() {
        long start = System.nanoTime();
        AnalyticsDto data = analyticsService.computeAnalytics();
        return wrap("uncached (always hits the database)", start, data);
    }

    private Map<String, Object> wrap(String mode, long startNanos, AnalyticsDto data) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mode", mode);
        body.put("timeTakenMs", (System.nanoTime() - startNanos) / 1_000_000);
        body.put("data", data);
        return body;
    }
}
