package com.example.dashboard.dto;

public record QueryDemoResult(String strategy, int postsLoaded, int commentsRead,
                              long sqlStatementsExecuted, long timeMs, String explanation) {
}
