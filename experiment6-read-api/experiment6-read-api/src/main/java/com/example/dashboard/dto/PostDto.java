package com.example.dashboard.dto;

import com.example.dashboard.model.Post;
import java.io.Serializable;
import java.time.LocalDateTime;

/** Slim response object (section 7 - reduce payload size). Serializable so Ehcache can store it. */
public record PostDto(Long id, String title, String content, int likes,
                      LocalDateTime createdAt, String authorName) implements Serializable {

    public static PostDto from(Post p) {
        return new PostDto(p.getId(), p.getTitle(), p.getContent(), p.getLikes(),
                p.getCreatedAt(), p.getAuthor().getName());
    }
}
