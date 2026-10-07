# Experiment 6 - Scalable Read APIs with Caching & Optimization

Spring Boot 3 + JPA/Hibernate + H2 (in-memory) + Ehcache 3 (via JCache).

## Requirements
- JDK 17 or newer (`java -version`)
- Apache Maven 3.6+ (`mvn -version`)
- Internet on the first run (Maven downloads dependencies)

## Run (Windows)
Unzip, open CMD in the folder and run:

    run.bat

or manually:

    mvn spring-boot:run

Open http://localhost:8080/ once you see `Started ScalableReadApiApplication`.
The database is seeded with 10 authors, 500 posts and 1-5 comments per post.

## Mapping to the experiment PDF

| PDF section / assignment | Where / how to test |
|---|---|
| 1. Pagination & sorting (Assignment 1) | `GET /posts?page=0&size=10&sort=likes,desc` (`PostController`) |
| 2. JPQL query | `GET /posts/author/1` (`PostRepository.findByAuthorId`) |
| 3. N+1 and JOIN FETCH (Assignment 2) | `GET /posts/demo/n-plus-one` vs `GET /posts/demo/join-fetch` - compare `sqlStatementsExecuted` (~500+ vs 1). Data: `GET /posts/with-comments` |
| 4. Ehcache `@Cacheable` (Assignment 3) | `GET /analytics` twice (slow, then fast - see `timeTakenMs`), `GET /posts/all`. Clear with `DELETE /cache`. Config: `ehcache.xml` |
| 5. Native SQL (Assignment 4) | `GET /posts/top` (`SELECT * FROM posts ORDER BY likes DESC LIMIT 5`) |
| 6. Benchmarking (Assignment 5) | `GET /benchmark/analytics?runs=5` (built-in) and JMeter plan `jmeter/experiment6-test-plan.jmx` |
| 7. Performance tuning | Indexes on `likes`, `created_at`, `author_id` (`Post.java`), DTOs for small payloads, max page size 100 |

## Quick tests (Windows CMD)

    curl "http://localhost:8080/posts?page=0&size=5&sort=likes,desc"
    curl http://localhost:8080/posts/demo/n-plus-one
    curl http://localhost:8080/posts/demo/join-fetch
    curl http://localhost:8080/analytics
    curl http://localhost:8080/analytics
    curl http://localhost:8080/posts/top
    curl "http://localhost:8080/benchmark/analytics?runs=5"

The analytics computation includes a simulated 500 ms delay
(`app.analytics.simulated-delay-ms` in `application.properties`) so the caching gain is clearly visible.
Allowed sort fields for `/posts`: `id`, `title`, `likes`, `createdAt`.

## JMeter (Assignment 5)
1. Start the app. 2. Open `jmeter/experiment6-test-plan.jmx` in Apache JMeter 5.x and press Run.
3. Compare the Summary Report rows for `/analytics/uncached` (before caching) and `/analytics` (after caching):
   average response time, throughput and error %.

Non-GUI: `jmeter -n -t jmeter\experiment6-test-plan.jmx -l results.jtl`

H2 console: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:postsdb`, user `sa`, empty password).
