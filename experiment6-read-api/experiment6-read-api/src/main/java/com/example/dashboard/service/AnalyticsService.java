package com.example.dashboard.service;

import com.example.dashboard.dto.AnalyticsDto;
import com.example.dashboard.dto.AuthorStatsDto;
import com.example.dashboard.dto.PostDto;
import com.example.dashboard.repository.CommentRepository;
import com.example.dashboard.repository.PostRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Computes dashboard analytics from the database. This is the expensive operation we cache. */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final long simulatedDelayMs;

    public AnalyticsService(PostRepository postRepository, CommentRepository commentRepository,
                            @Value("${app.analytics.simulated-delay-ms:500}") long simulatedDelayMs) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.simulatedDelayMs = simulatedDelayMs;
    }

    public AnalyticsDto computeAnalytics() {
        simulateHeavyWork();

        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        Long likes = postRepository.sumLikes();
        Double avg = postRepository.averageLikes();

        List<AuthorStatsDto> topAuthors = postRepository.findAuthorStats().stream()
                .limit(5)
                .collect(Collectors.toCollection(ArrayList::new));

        List<PostDto> topPosts = postRepository
                .findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "likes")))
                .map(PostDto::from)
                .getContent().stream()
                .collect(Collectors.toCollection(ArrayList::new));

        return new AnalyticsDto(totalPosts, totalComments,
                likes == null ? 0 : likes,
                avg == null ? 0.0 : Math.round(avg * 100.0) / 100.0,
                topAuthors, topPosts, LocalDateTime.now());
    }

    private void simulateHeavyWork() {
        if (simulatedDelayMs <= 0) {
            return;
        }
        try {
            Thread.sleep(simulatedDelayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
