package com.example.dashboard.dto;

import java.io.Serializable;

public record AuthorStatsDto(String authorName, Long postCount, Long totalLikes) implements Serializable {
}
