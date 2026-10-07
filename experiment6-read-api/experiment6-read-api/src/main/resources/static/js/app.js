/**
 * Experiment 6 - Scalable Read APIs Dashboard Logic
 * Handles interactive tabs, live API queries, telemetry benchmarks, and UI state.
 */

// Application State
const state = {
  pagination: {
    page: 0,
    size: 10,
    sortField: 'likes',
    sortDir: 'desc',
    authorId: '',
    totalPages: 1,
    totalElements: 0
  },
  cachedBaselineMs: null,
  cachedHitMs: null
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGlobalControls();
  initPaginationTab();
  initNPlusOneTab();
  initCachingTab();
  initNativeSqlTab();
  initBenchmarkTab();

  // Load initial dataset
  fetchPosts();
});

/* ==========================================================================
   Tab Navigation Controller
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Auto-fetch data on first tab entry if appropriate
      if (targetId === 'tab-native' && !state.topPostsLoaded) {
        fetchTopPosts();
        state.topPostsLoaded = true;
      }
    });
  });
}

/* ==========================================================================
   Global Cache & System Controls
   ========================================================================== */
function initGlobalControls() {
  const clearGlobalBtn = document.getElementById('clearCacheGlobalBtn');
  if (clearGlobalBtn) {
    clearGlobalBtn.addEventListener('click', async () => {
      try {
        clearGlobalBtn.disabled = true;
        clearGlobalBtn.innerHTML = `<span>Clearing...</span>`;
        await fetch('/cache', { method: 'DELETE' });
        showNotification('Ehcache entries cleared successfully');
      } catch (err) {
        console.error('Failed to clear cache:', err);
      } finally {
        clearGlobalBtn.disabled = false;
        clearGlobalBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          Clear Cache
        `;
      }
    });
  }
}

/* ==========================================================================
   Assignment 1: Pagination & Sorting
   ========================================================================== */
function initPaginationTab() {
  const sortFieldSelect = document.getElementById('sortFieldSelect');
  const sortDirSelect = document.getElementById('sortDirSelect');
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const authorFilterSelect = document.getElementById('authorFilterSelect');
  const refreshBtn = document.getElementById('refreshPostsBtn');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (sortFieldSelect) {
    sortFieldSelect.addEventListener('change', (e) => {
      state.pagination.sortField = e.target.value;
      state.pagination.page = 0;
      fetchPosts();
    });
  }

  if (sortDirSelect) {
    sortDirSelect.addEventListener('change', (e) => {
      state.pagination.sortDir = e.target.value;
      state.pagination.page = 0;
      fetchPosts();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      state.pagination.size = parseInt(e.target.value, 10);
      state.pagination.page = 0;
      fetchPosts();
    });
  }

  if (authorFilterSelect) {
    authorFilterSelect.addEventListener('change', (e) => {
      state.pagination.authorId = e.target.value;
      state.pagination.page = 0;
      fetchPosts();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => fetchPosts());
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.pagination.page > 0) {
        state.pagination.page--;
        fetchPosts();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.pagination.page < state.pagination.totalPages - 1) {
        state.pagination.page++;
        fetchPosts();
      }
    });
  }
}

async function fetchPosts() {
  const container = document.getElementById('postsContainer');
  const trackerEl = document.getElementById('currentQueryUrl');
  const timeEl = document.getElementById('pageQueryTime');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const curPageEl = document.getElementById('currentPageIndicator');
  const infoEl = document.getElementById('paginationInfo');

  if (!container) return;
  container.innerHTML = `<div class="loading-spinner">Fetching paginated data from Spring Boot...</div>`;

  const { page, size, sortField, sortDir, authorId } = state.pagination;
  let endpoint = '';

  if (authorId) {
    endpoint = `/posts/author/${authorId}`;
    if (trackerEl) trackerEl.textContent = endpoint;
  } else {
    endpoint = `/posts?page=${page}&size=${size}&sort=${sortField},${sortDir}`;
    if (trackerEl) trackerEl.textContent = endpoint;
  }

  const startTime = performance.now();
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    const elapsed = Math.round(performance.now() - startTime);
    if (timeEl) timeEl.textContent = `${elapsed} ms`;

    let posts = [];
    if (authorId) {
      posts = data;
      state.pagination.totalPages = 1;
      state.pagination.totalElements = posts.length;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (curPageEl) curPageEl.textContent = `Author Filter: ${posts.length} results`;
      if (infoEl) infoEl.textContent = `Showing all ${posts.length} posts for selected author`;
    } else {
      posts = data.content || [];
      state.pagination.totalPages = data.totalPages || 1;
      state.pagination.totalElements = data.totalElements || 0;

      if (prevBtn) prevBtn.disabled = data.first;
      if (nextBtn) nextBtn.disabled = data.last;
      if (curPageEl) curPageEl.textContent = `Page ${data.page + 1} / ${data.totalPages}`;
      const startCount = data.page * data.size + 1;
      const endCount = Math.min((data.page + 1) * data.size, data.totalElements);
      if (infoEl) infoEl.textContent = `Showing ${startCount}-${endCount} of ${data.totalElements} records`;
    }

    renderPosts(posts, container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state text-danger">Failed to load posts: ${err.message}</div>`;
  }
}

function renderPosts(posts, container) {
  if (!posts || posts.length === 0) {
    container.innerHTML = `<div class="empty-state">No posts matched current query criteria.</div>`;
    return;
  }

  container.innerHTML = posts.map(post => {
    const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <article class="post-card">
        <div class="post-meta-top">
          <span class="post-id-badge">#ID ${post.id}</span>
          <span class="post-likes-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ${post.likes.toLocaleString()}
          </span>
        </div>
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-content">${escapeHtml(post.content)}</p>
        <div class="post-footer">
          <span class="post-author">&bull; ${escapeHtml(post.authorName)}</span>
          <span class="post-date">${formattedDate}</span>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   Assignment 2: N+1 Problem & JOIN FETCH
   ========================================================================== */
function initNPlusOneTab() {
  const runN1Btn = document.getElementById('runNPlusOneBtn');
  const runJoinBtn = document.getElementById('runJoinFetchBtn');
  const runBothBtn = document.getElementById('runBothComparisonBtn');

  if (runN1Btn) {
    runN1Btn.addEventListener('click', () => runNPlusOneDemo());
  }

  if (runJoinBtn) {
    runJoinBtn.addEventListener('click', () => runJoinFetchDemo());
  }

  if (runBothBtn) {
    runBothBtn.addEventListener('click', async () => {
      runBothBtn.disabled = true;
      runBothBtn.textContent = 'Running N+1 query...';
      const n1 = await runNPlusOneDemo();
      runBothBtn.textContent = 'Running JOIN FETCH query...';
      const jf = await runJoinFetchDemo();
      runBothBtn.disabled = false;
      runBothBtn.textContent = 'Run Head-to-Head Comparison';

      if (n1 && jf) {
        const queryDiff = n1.sqlStatementsExecuted - jf.sqlStatementsExecuted;
        const reductionPct = Math.round((queryDiff / n1.sqlStatementsExecuted) * 100);
        const banner = document.getElementById('n1ComparisonBanner');
        const text = document.getElementById('n1SummaryText');
        if (text) {
          text.innerHTML = `
            <strong>Massive Optimization Verified:</strong>
            JOIN FETCH reduced SQL queries from <span class="text-danger font-bold">${n1.sqlStatementsExecuted} queries</span> down to <span class="text-success font-bold">${jf.sqlStatementsExecuted} query</span> (<span class="highlight-green">${reductionPct}% statement reduction</span>).
            Latency was reduced from <strong>${n1.timeMs} ms</strong> to <strong>${jf.timeMs} ms</strong>!
          `;
        }
      }
    });
  }
}

async function runNPlusOneDemo() {
  const sqlEl = document.getElementById('n1SqlCount');
  const timeEl = document.getElementById('n1Time');
  const postsEl = document.getElementById('n1Posts');
  const commEl = document.getElementById('n1Comments');

  if (sqlEl) sqlEl.textContent = '...';
  try {
    const res = await fetch('/posts/demo/n-plus-one');
    const data = await res.json();
    if (sqlEl) sqlEl.textContent = data.sqlStatementsExecuted;
    if (timeEl) timeEl.textContent = `${data.timeMs} ms`;
    if (postsEl) postsEl.textContent = data.postsLoaded;
    if (commEl) commEl.textContent = data.commentsRead.toLocaleString();
    return data;
  } catch (err) {
    console.error('N+1 failed:', err);
    return null;
  }
}

async function runJoinFetchDemo() {
  const sqlEl = document.getElementById('joinFetchSqlCount');
  const timeEl = document.getElementById('joinFetchTime');
  const postsEl = document.getElementById('joinFetchPosts');
  const commEl = document.getElementById('joinFetchComments');

  if (sqlEl) sqlEl.textContent = '...';
  try {
    const res = await fetch('/posts/demo/join-fetch');
    const data = await res.json();
    if (sqlEl) sqlEl.textContent = data.sqlStatementsExecuted;
    if (timeEl) timeEl.textContent = `${data.timeMs} ms`;
    if (postsEl) postsEl.textContent = data.postsLoaded;
    if (commEl) commEl.textContent = data.commentsRead.toLocaleString();
    return data;
  } catch (err) {
    console.error('JOIN FETCH failed:', err);
    return null;
  }
}

/* ==========================================================================
   Assignment 3: Caching with Ehcache
   ========================================================================== */
function initCachingTab() {
  const cachedBtn = document.getElementById('fetchCachedAnalyticsBtn');
  const uncachedBtn = document.getElementById('fetchUncachedAnalyticsBtn');
  const clearBtn = document.getElementById('clearCacheBtn');

  if (cachedBtn) {
    cachedBtn.addEventListener('click', () => fetchAnalytics(true));
  }
  if (uncachedBtn) {
    uncachedBtn.addEventListener('click', () => fetchAnalytics(false));
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      await fetch('/cache', { method: 'DELETE' });
      const badge = document.getElementById('cacheHitBadge');
      if (badge) {
        badge.className = 'badge badge-rose';
        badge.textContent = 'Cache Cleared (Next is Miss)';
      }
      showNotification('Ehcache entries cleared. The next request will hit the database.');
    });
  }
}

async function fetchAnalytics(useCache) {
  const modeEl = document.getElementById('lastCacheMode');
  const latencyEl = document.getElementById('lastCacheLatency');
  const badgeEl = document.getElementById('cacheHitBadge');
  const speedupEl = document.getElementById('cacheSpeedupFactor');
  const url = useCache ? '/analytics' : '/analytics/uncached';

  if (modeEl) modeEl.textContent = useCache ? 'Fetching (Cached)...' : 'Fetching (Uncached)...';
  try {
    const res = await fetch(url);
    const body = await res.json();

    const timeTaken = body.timeTakenMs;
    const data = body.data;

    if (modeEl) modeEl.textContent = body.mode;
    if (latencyEl) latencyEl.textContent = `${timeTaken} ms`;

    if (useCache) {
      if (timeTaken > 300) {
        // First request is a cache miss (simulated 500ms delay)
        state.cachedBaselineMs = timeTaken;
        if (badgeEl) {
          badgeEl.className = 'badge badge-amber';
          badgeEl.textContent = 'Cache Miss (Populated RAM)';
        }
        if (speedupEl) speedupEl.textContent = 'Baseline (1x)';
      } else {
        // Subsequent requests are cache hits (<10ms)
        state.cachedHitMs = Math.max(1, timeTaken);
        if (badgeEl) {
          badgeEl.className = 'badge badge-emerald';
          badgeEl.textContent = '⚡ Cache Hit (Ehcache RAM)';
        }
        if (state.cachedBaselineMs && speedupEl) {
          const factor = Math.round(state.cachedBaselineMs / state.cachedHitMs);
          speedupEl.textContent = `${factor}x Faster!`;
        }
      }
    } else {
      if (badgeEl) {
        badgeEl.className = 'badge badge-rose';
        badgeEl.textContent = 'Uncached DB Query';
      }
      if (speedupEl) speedupEl.textContent = 'Baseline (1x)';
    }

    // Populate KPI cards
    if (data) {
      document.getElementById('kpiTotalPosts').textContent = data.totalPosts.toLocaleString();
      document.getElementById('kpiTotalComments').textContent = data.totalComments.toLocaleString();
      document.getElementById('kpiTotalLikes').textContent = data.totalLikes.toLocaleString();
      document.getElementById('kpiAvgLikes').textContent = data.averageLikesPerPost;

      // Populate authors list
      renderTopAuthors(data.topAuthors);
    }
  } catch (err) {
    console.error('Analytics request failed:', err);
  }
}

function renderTopAuthors(authors) {
  const container = document.getElementById('topAuthorsContainer');
  if (!container || !authors) return;

  container.innerHTML = authors.map((author, idx) => `
    <div class="author-stat-row">
      <div class="author-rank-name">
        <span class="rank-badge">#${idx + 1}</span>
        <span class="author-name-text">${escapeHtml(author.authorName)}</span>
      </div>
      <div class="author-metrics">
        <span class="text-secondary">${author.postCount} posts</span>
        <span class="highlight-cyan font-bold">${author.totalLikes.toLocaleString()} likes</span>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Assignment 4: Native SQL Query
   ========================================================================== */
function initNativeSqlTab() {
  const topBtn = document.getElementById('fetchTopPostsBtn');
  if (topBtn) {
    topBtn.addEventListener('click', () => fetchTopPosts());
  }
}

async function fetchTopPosts() {
  const container = document.getElementById('topPostsContainer');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner">Executing native query: SELECT * FROM posts ORDER BY likes DESC LIMIT 5...</div>`;
  try {
    const res = await fetch('/posts/top');
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      container.innerHTML = `<div class="empty-state">No top posts found.</div>`;
      return;
    }

    const medals = ['🥇 Gold Tier', '🥈 Silver Tier', '🥉 Bronze Tier', '⭐ Top 4', '⭐ Top 5'];
    container.innerHTML = posts.map((post, idx) => `
      <div class="podium-card rank-${idx + 1}">
        <div class="post-meta-top">
          <span class="badge ${idx === 0 ? 'badge-amber' : 'badge-indigo'}">${medals[idx] || '#' + (idx + 1)}</span>
          <span class="post-likes-badge font-bold">${post.likes.toLocaleString()} Likes</span>
        </div>
        <h4 class="post-title">${escapeHtml(post.title)}</h4>
        <p class="post-content">${escapeHtml(post.content)}</p>
        <div class="post-footer">
          <span class="post-author">${escapeHtml(post.authorName)}</span>
          <span class="post-id-badge">Post ID #${post.id}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state text-danger">Failed to execute native query: ${err.message}</div>`;
  }
}

/* ==========================================================================
   Assignment 5: Benchmarking & JMeter
   ========================================================================== */
function initBenchmarkTab() {
  const runBtn = document.getElementById('runBenchmarkBtn');
  const runsSelect = document.getElementById('benchmarkRunsSelect');

  if (runBtn) {
    runBtn.addEventListener('click', async () => {
      const runs = runsSelect ? runsSelect.value : 5;
      runBtn.disabled = true;
      runBtn.innerHTML = `<span>Benchmarking ${runs} runs...</span>`;

      try {
        const res = await fetch(`/benchmark/analytics?runs=${runs}`);
        const data = await res.json();

        const uncachedAvg = data.withoutCache.averageMs;
        const cachedAvg = data.withCache.averageHitMs;
        const speedup = data.speedupFactor;

        document.getElementById('bmUncachedAvg').textContent = `${uncachedAvg} ms`;
        document.getElementById('bmCachedAvg').textContent = `${cachedAvg} ms`;
        document.getElementById('bmSpeedup').textContent = `${speedup}`;

        document.getElementById('bmUncachedRuns').textContent = `Runs: [ ${data.withoutCache.runsMs.join(', ')} ] ms`;
        document.getElementById('bmCachedRuns').textContent = `Miss: ${data.withCache['firstCallMs (cache miss)']} ms &bull; Hits: [ ${data.withCache.runsMs.slice(1).join(', ')} ] ms`;

        const badge = document.getElementById('bmEfficiencyBadge');
        if (badge) {
          badge.textContent = `Completed ${runs} iterations`;
          badge.className = 'badge badge-emerald';
        }
      } catch (err) {
        console.error('Benchmark failed:', err);
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run Benchmark (GET /benchmark/analytics)
        `;
      }
    });
  }
}

/* ==========================================================================
   Utility Functions
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.style.position = 'fixed';
  notif.style.bottom = '24px';
  notif.style.right = '24px';
  notif.style.background = '#10b981';
  notif.style.color = '#fff';
  notif.style.padding = '12px 20px';
  notif.style.borderRadius = '10px';
  notif.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  notif.style.fontWeight = '600';
  notif.style.zIndex = '9999';
  notif.style.transition = 'all 0.3s ease';
  notif.textContent = msg;

  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateY(10px)';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}
