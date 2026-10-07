package com.example.dashboard.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("GET /posts?page=0&size=10&sort=likes,desc", "Assignment 1 - paginated + sorted posts");
        endpoints.put("GET /posts/all", "All posts, cached with Ehcache");
        endpoints.put("GET /posts/author/{id}", "JPQL query by author");
        endpoints.put("GET /posts/top", "Assignment 4 - native query, top 5 posts by likes");
        endpoints.put("GET /posts/with-comments", "JOIN FETCH - posts with comments");
        endpoints.put("GET /posts/demo/n-plus-one", "Assignment 2 - N+1 problem (count SQL statements)");
        endpoints.put("GET /posts/demo/join-fetch", "Assignment 2 - fixed with JOIN FETCH");
        endpoints.put("GET /analytics", "Assignment 3 - cached analytics (call it twice)");
        endpoints.put("GET /analytics/uncached", "Analytics without cache (baseline)");
        endpoints.put("GET /benchmark/analytics?runs=5", "Assignment 5 - before/after caching comparison");
        endpoints.put("GET /cache", "List caches");
        endpoints.put("DELETE /cache", "Clear all caches");
        endpoints.put("/h2-console", "H2 console (JDBC URL: jdbc:h2:mem:postsdb, user: sa, empty password)");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("application", "Experiment 6 - Scalable Read APIs with Caching & Optimization");
        body.put("endpoints", endpoints);
        return body;
    }
}
