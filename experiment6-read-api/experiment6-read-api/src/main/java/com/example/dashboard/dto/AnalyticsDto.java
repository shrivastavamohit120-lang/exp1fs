package com.example.dashboard.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

public record AnalyticsDto(long totalPosts, long totalComments, long totalLikes,
                           double averageLikesPerPost,
                           List<AuthorStatsDto> topAuthors,
                           List<PostDto> topPosts,
                           LocalDateTime computedAt) implements Serializable {
}
