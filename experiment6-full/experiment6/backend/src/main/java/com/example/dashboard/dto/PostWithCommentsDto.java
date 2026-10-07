package com.example.dashboard.dto;

import com.example.dashboard.model.Post;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public record PostWithCommentsDto(Long id, String title, int likes, String authorName,
                                  int commentCount, List<String> comments) implements Serializable {

    public static PostWithCommentsDto from(Post p) {
        List<String> bodies = new ArrayList<>();
        p.getComments().forEach(c -> bodies.add(c.getBody()));
        return new PostWithCommentsDto(p.getId(), p.getTitle(), p.getLikes(),
                p.getAuthor().getName(), bodies.size(), bodies);
    }
}
