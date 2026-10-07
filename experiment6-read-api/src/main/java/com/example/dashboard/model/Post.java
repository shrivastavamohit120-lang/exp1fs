package com.example.dashboard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Indexes (section 7 - backend performance tuning) support the columns used for
 * sorting (created_at, likes) and filtering (author_id).
 */
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_likes", columnList = "likes"),
        @Index(name = "idx_posts_created_at", columnList = "created_at"),
        @Index(name = "idx_posts_author", columnList = "author_id")
})
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String content;

    @Column(nullable = false)
    private int likes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private Author author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    protected Post() { }

    public Post(String title, String content, int likes, LocalDateTime createdAt, Author author) {
        this.title = title;
        this.content = content;
        this.likes = likes;
        this.createdAt = createdAt;
        this.author = author;
    }

    public void addComment(Comment comment) {
        comment.setPost(this);
        comments.add(comment);
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public int getLikes() { return likes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Author getAuthor() { return author; }
    public List<Comment> getComments() { return comments; }
}
