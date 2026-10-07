package com.example.dashboard.service;

import com.example.dashboard.dto.PostDto;
import com.example.dashboard.dto.PostWithCommentsDto;
import com.example.dashboard.dto.QueryDemoResult;
import com.example.dashboard.model.Post;
import com.example.dashboard.repository.PostRepository;
import jakarta.persistence.EntityManagerFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final EntityManagerFactory entityManagerFactory;

    public PostService(PostRepository postRepository, EntityManagerFactory entityManagerFactory) {
        this.postRepository = postRepository;
        this.entityManagerFactory = entityManagerFactory;
    }

    /** Pagination + sorting. */
    public Page<PostDto> getPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostDto::from);
    }

    /** Section 4: first call hits the database, later calls are served from the Ehcache "posts" cache. */
    @Cacheable("posts")
    public List<PostDto> getAllPosts() {
        return postRepository.findAllWithAuthor().stream()
                .map(PostDto::from)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public List<PostDto> getPostsByAuthor(Long authorId) {
        return postRepository.findByAuthorId(authorId).stream()
                .map(PostDto::from)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /** Section 5: native SQL query. */
    public List<PostDto> getTopPosts() {
        return postRepository.findTopPosts().stream()
                .map(PostDto::from)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /** Section 3: JOIN FETCH - posts + comments + author in a single query. */
    public List<PostWithCommentsDto> getAllWithComments() {
        return postRepository.findAllWithComments().stream()
                .map(PostWithCommentsDto::from)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    // ------------------------------------------------------------------
    // Assignment 2 - N+1 demonstration (counts the real SQL statements)
    // ------------------------------------------------------------------

    public QueryDemoResult demoNPlusOne() {
        return measure("N+1 (lazy loading)", postRepository::findAllNaive,
                "1 query loads the posts, then 1 extra query per post for its comments "
                        + "(and one per distinct author).");
    }

    public QueryDemoResult demoJoinFetch() {
        return measure("JOIN FETCH", postRepository::findAllWithComments,
                "Posts, comments and authors are loaded with a single SQL JOIN.");
    }

    private QueryDemoResult measure(String strategy, Supplier<List<Post>> loader, String explanation) {
        Statistics stats = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        stats.clear();
        long start = System.nanoTime();

        List<Post> posts = loader.get();
        int comments = 0;
        for (Post post : posts) {
            comments += post.getComments().size();   // triggers lazy loading when not fetched
            post.getAuthor().getName();
        }

        long ms = (System.nanoTime() - start) / 1_000_000;
        return new QueryDemoResult(strategy, posts.size(), comments,
                stats.getPrepareStatementCount(), ms, explanation);
    }
}
