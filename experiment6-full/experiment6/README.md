# Experiment 6 - Scalable Read APIs with Caching & Optimization

```
experiment6/
  backend/              Spring Boot REST API (Java, JPA, H2, Ehcache) + JMeter plan
  frontend/             Dashboard (HTML, CSS, JavaScript) that calls the backend
  run-backend.bat       starts the backend  -> http://localhost:8080
  open-frontend.bat     opens the dashboard in your browser
```

## How to run
Requirements: JDK 17+ and Maven (`java -version`, `mvn -version`).

1. Double-click `run-backend.bat` (or run it in cmd). Wait for `Started ScalableReadApiApplication`. Keep the window open.
2. Double-click `open-frontend.bat` (or open `frontend/index.html` in Chrome/Edge).

The dashboard shows: paginated and sorted posts, cached vs uncached analytics timing,
the N+1 vs JOIN FETCH SQL count, native-query top posts and the benchmark.
Backend API details: see `backend/README.md`.
