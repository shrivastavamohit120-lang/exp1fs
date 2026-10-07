package com.example.dashboard.controller;

import com.example.dashboard.dto.PageResponse;
import com.example.dashboard.dto.PostDto;
import com.example.dashboard.dto.PostWithCommentsDto;
import com.example.dashboard.dto.QueryDemoResult;
import com.example.dashboard.service.PostService;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/posts")
public class PostController {

    private static final Set<String> SORTABLE_FIELDS = Set.of("id", "title", "likes", "createdAt");

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Assignment 1 - Paginated & sorted API.
     * Example: GET /posts?page=0&size=10&sort=likes,desc
     */
    @GetMapping
    public PageResponse<PostDto> getPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        for (Sort.Order order : pageable.getSort()) {
            if (!SORTABLE_FIELDS.contains(order.getProperty())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot sort by '" + order.getProperty() + "'. Allowed: " + SORTABLE_FIELDS);
            }
        }
        return PageResponse.from(postService.getPosts(pageable));
    }

    /** All posts, cached with Ehcache ("posts" cache). */
    @GetMapping("/all")
    public List<PostDto> getAllPosts() {
        return postService.getAllPosts();
    }

    /** JPQL query: GET /posts/author/1 */
    @GetMapping("/author/{authorId}")
    public List<PostDto> getByAuthor(@PathVariable Long authorId) {
        return postService.getPostsByAuthor(authorId);
    }

    /** Assignment 4 - native query for top-performing posts. */
    @GetMapping("/top")
    public List<PostDto> getTopPosts() {
        return postService.getTopPosts();
    }

    /** JOIN FETCH result with comments. */
    @GetMapping("/with-comments")
    public List<PostWithCommentsDto> getAllWithComments() {
        return postService.getAllWithComments();
    }

    /** Assignment 2 - shows the N+1 problem (look at sqlStatementsExecuted). */
    @GetMapping("/demo/n-plus-one")
    public QueryDemoResult nPlusOne() {
        return postService.demoNPlusOne();
    }

    /** Assignment 2 - the fix using JOIN FETCH. */
    @GetMapping("/demo/join-fetch")
    public QueryDemoResult joinFetch() {
        return postService.demoJoinFetch();
    }
}
