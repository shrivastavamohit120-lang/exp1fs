package com.example.dashboard.config;

import com.example.dashboard.model.Author;
import com.example.dashboard.model.Comment;
import com.example.dashboard.model.Post;
import com.example.dashboard.repository.AuthorRepository;
import com.example.dashboard.repository.PostRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Seeds the in-memory H2 database with sample authors, posts and comments. */
@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);
    private static final String[] AUTHOR_NAMES = {
            "Aarav Sharma", "Priya Singh", "Rohan Gupta", "Ananya Verma", "Vikram Mehta",
            "Neha Kapoor", "Arjun Reddy", "Simran Kaur", "Karan Malhotra", "Isha Patel"
    };
    private static final String[] TOPICS = {
            "Spring Boot", "Caching", "Pagination", "JPA", "Hibernate", "Microservices",
            "REST APIs", "Database Indexing", "Performance Tuning", "Analytics"
    };

    private final AuthorRepository authorRepository;
    private final PostRepository postRepository;
    private final int postCount;

    public DataLoader(AuthorRepository authorRepository, PostRepository postRepository,
                      @Value("${app.seed.posts:500}") int postCount) {
        this.authorRepository = authorRepository;
        this.postRepository = postRepository;
        this.postCount = postCount;
    }

    @Override
    public void run(String... args) {
        if (authorRepository.count() > 0) {
            return;
        }
        Random random = new Random(42);

        List<Author> authors = new ArrayList<>();
        for (String name : AUTHOR_NAMES) {
            String email = name.toLowerCase().replace(" ", ".") + "@example.com";
            authors.add(new Author(name, email));
        }
        authors = authorRepository.saveAll(authors);

        List<Post> posts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 1; i <= postCount; i++) {
            String topic = TOPICS[random.nextInt(TOPICS.length)];
            Post post = new Post(
                    "Post #" + i + ": Understanding " + topic,
                    "Sample content for post " + i + " about " + topic + ".",
                    random.nextInt(5000),
                    now.minusMinutes(random.nextInt(60 * 24 * 30)),
                    authors.get(random.nextInt(authors.size())));
            int comments = 1 + random.nextInt(5);
            for (int c = 1; c <= comments; c++) {
                post.addComment(new Comment("Comment " + c + " on post " + i));
            }
            posts.add(post);
        }
        postRepository.saveAll(posts);
        log.info("Seeded {} authors and {} posts (with comments)", authors.size(), posts.size());
        log.info("API is ready: http://localhost:8080/");
    }
}
