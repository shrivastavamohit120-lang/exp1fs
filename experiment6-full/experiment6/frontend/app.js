// Change this if your backend runs on another host/port.
const API = "http://localhost:8080";

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("apiBase").textContent = API;

async function api(path, options) {
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
  return res.json();
}

function showError(err) {
  const box = $("error");
  box.hidden = false;
  box.textContent = "Error: " + err.message +
    " (is the backend running? start it with run-backend.bat)";
}
function clearError() { $("error").hidden = true; }

// ---------- backend status ----------
async function checkBackend() {
  const badge = $("status");
  try {
    await api("/");
    badge.textContent = "backend online";
    badge.className = "badge ok";
    clearError();
    return true;
  } catch (e) {
    badge.textContent = "backend offline";
    badge.className = "badge bad";
    showError(e);
    return false;
  }
}

// ---------- 1. pagination & sorting ----------
const state = { page: 0, size: 10, sort: "createdAt", dir: "desc", last: true };

async function loadPosts() {
  try {
    const url = `/posts?page=${state.page}&size=${state.size}&sort=${state.sort},${state.dir}`;
    const data = await api(url);
    state.last = data.last;
    $("postsBody").innerHTML = data.content.map((p) =>
      `<tr><td>${esc(p.id)}</td><td>${esc(p.title)}</td><td>${esc(p.authorName)}</td>` +
      `<td>${esc(p.likes)}</td><td>${esc(p.createdAt.replace("T", " ").slice(0, 16))}</td></tr>`
    ).join("") || `<tr><td colspan="5">No data</td></tr>`;
    $("pageInfo").textContent =
      `Page ${data.page + 1} of ${data.totalPages} (${data.totalElements} posts)`;
    $("prevBtn").disabled = data.first;
    $("nextBtn").disabled = data.last;
    clearError();
  } catch (e) { showError(e); }
}

$("sortField").onchange = (e) => { state.sort = e.target.value; state.page = 0; loadPosts(); };
$("sortDir").onchange = (e) => { state.dir = e.target.value; state.page = 0; loadPosts(); };
$("pageSize").onchange = (e) => { state.size = Number(e.target.value); state.page = 0; loadPosts(); };
$("prevBtn").onclick = () => { if (state.page > 0) { state.page--; loadPosts(); } };
$("nextBtn").onclick = () => { if (!state.last) { state.page++; loadPosts(); } };

// ---------- 2. caching ----------
const timings = [];

function renderBars() {
  const max = Math.max(1, ...timings.map((t) => t.ms));
  $("timeBars").innerHTML = timings.slice(-8).map((t) =>
    `<div class="bar-row"><span class="bar-label">${esc(t.label)}</span>` +
    `<div class="bar ${t.cls}" style="width:${Math.max(3, (t.ms / max) * 200)}px"></div>` +
    `<span>${esc(t.ms)} ms</span></div>`).join("");
}

async function callAnalytics(path, label, cls) {
  try {
    const res = await api(path);
    timings.push({ label, ms: res.timeTakenMs, cls });
    renderBars();
    const d = res.data;
    $("analyticsSummary").innerHTML =
      `<b>Total posts:</b> ${esc(d.totalPosts)} &nbsp; <b>Comments:</b> ${esc(d.totalComments)} &nbsp; ` +
      `<b>Total likes:</b> ${esc(d.totalLikes)} &nbsp; <b>Avg likes/post:</b> ${esc(d.averageLikesPerPost)}<br>` +
      `<b>Top authors:</b> ` +
      d.topAuthors.map((a) => `${esc(a.authorName)} (${esc(a.totalLikes)})`).join(", ") + `<br>` +
      `<b>Computed at:</b> ${esc(d.computedAt)}`;
    clearError();
  } catch (e) { showError(e); }
}

$("uncachedBtn").onclick = () => callAnalytics("/analytics/uncached", "uncached", "uncached");
$("cachedBtn").onclick = () => callAnalytics("/analytics", "cached", "cached");
$("clearBtn").onclick = async () => {
  try {
    await api("/cache", { method: "DELETE" });
    timings.length = 0;
    renderBars();
    $("analyticsSummary").textContent = "Cache cleared - next CACHED call will be a miss.";
  } catch (e) { showError(e); }
};

// ---------- 3. N+1 ----------
$("nplusBtn").onclick = async () => {
  try {
    const bad = await api("/posts/demo/n-plus-one");
    const good = await api("/posts/demo/join-fetch");
    const body = $("nplusTable").querySelector("tbody");
    body.innerHTML = [bad, good].map((r) =>
      `<tr><td>${esc(r.strategy)}</td><td>${esc(r.sqlStatementsExecuted)}</td><td>${esc(r.timeMs)}</td></tr>`
    ).join("");
    $("nplusTable").hidden = false;
    clearError();
  } catch (e) { showError(e); }
};

// ---------- 4. top posts (native query) ----------
$("topBtn").onclick = async () => {
  try {
    const posts = await api("/posts/top");
    $("topList").innerHTML = posts.map((p) =>
      `<li>${esc(p.title)} &mdash; <b>${esc(p.likes)}</b> likes (${esc(p.authorName)})</li>`).join("");
    clearError();
  } catch (e) { showError(e); }
};

// ---------- 5. benchmark ----------
$("benchBtn").onclick = async () => {
  $("benchResult").textContent = "Running... (takes a few seconds)";
  try {
    const r = await api("/benchmark/analytics?runs=5");
    $("benchResult").innerHTML =
      `<b>Without cache:</b> avg ${esc(r.withoutCache.averageMs)} ms (runs: ${esc(r.withoutCache.runsMs.join(", "))})<br>` +
      `<b>With cache:</b> first call ${esc(r.withCache["firstCallMs (cache miss)"])} ms, ` +
      `avg hit ${esc(r.withCache.averageHitMs)} ms (runs: ${esc(r.withCache.runsMs.join(", "))})<br>` +
      `<b>Speedup:</b> ${esc(r.speedupFactor)}`;
    clearError();
  } catch (e) { $("benchResult").textContent = ""; showError(e); }
};

// ---------- start ----------
(async () => {
  if (await checkBackend()) loadPosts();
})();
