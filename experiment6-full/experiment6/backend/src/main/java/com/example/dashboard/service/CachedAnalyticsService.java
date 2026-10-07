package com.example.dashboard.service;

import com.example.dashboard.dto.AnalyticsDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/** Section 4 / Code Integration Example: "Caching Analytics Data". */
@Service
public class CachedAnalyticsService {

    private final AnalyticsService analyticsService;

    public CachedAnalyticsService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Cacheable("analytics")
    public AnalyticsDto getAnalytics() {
        return analyticsService.computeAnalytics();
    }
}
