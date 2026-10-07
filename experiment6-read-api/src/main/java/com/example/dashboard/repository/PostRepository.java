package com.example.dashboard.repository;

import com.example.dashboard.dto.AuthorStatsDto;
import com.example.dashboard.model.Post;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    /** Pagination + sorting (Pageable). The entity graph loads the author in the same query. */
    @Override
    @EntityGraph(attributePaths = "author")
    Page<Post> findAll(Pageable pageable);

    /** JPQL query (section 2). */
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId ORDER BY p.createdAt DESC")
    @EntityGraph(attributePaths = "author")
    List<Post> findByAuthorId(@Param("authorId") Long authorId);

    /** Loads all posts with their author in a single query. */
    @Query("SELECT p FROM Post p JOIN FETCH p.author")
    List<Post> findAllWithAuthor();

    /** Intentionally naive query - used to demonstrate the N+1 problem (section 3). */
    @Query("SELECT p FROM Post p")
    List<Post> findAllNaive();

    /** N+1 solution: JOIN FETCH loads posts, authors and comments in ONE query (section 3). */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.comments JOIN FETCH p.author")
    List<Post> findAllWithComments();

    /** Native SQL query (section 5). */
    @Query(value = "SELECT * FROM posts ORDER BY likes DESC LIMIT 5", nativeQuery = true)
    List<Post> findTopPosts();

    // ---- aggregate queries used by the analytics dashboard ----

    @Query("SELECT SUM(p.likes) FROM Post p")
    Long sumLikes();

    @Query("SELECT AVG(p.likes) FROM Post p")
    Double averageLikes();

    @Query("SELECT new com.example.dashboard.dto.AuthorStatsDto(a.name, COUNT(p), SUM(p.likes)) "
            + "FROM Post p JOIN p.author a GROUP BY a.name ORDER BY SUM(p.likes) DESC")
    List<AuthorStatsDto> findAuthorStats();
}
