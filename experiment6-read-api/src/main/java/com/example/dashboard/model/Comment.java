package com.example.dashboard.model;

import jakarta.persistence.*;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500, nullable = false)
    private String body;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    protected Comment() { }

    public Comment(String body) {
        this.body = body;
    }

    public Long getId() { return id; }
    public String getBody() { return body; }
    public Post getPost() { return post; }
    void setPost(Post post) { this.post = post; }
}
