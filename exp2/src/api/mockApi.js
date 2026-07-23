// Simulated backend. In the PDF this is "/mock-api/posts" — here it's an
// in-memory mock with artificial latency so the pending/fulfilled/rejected
// lifecycle (createAsyncThunk) has something real to show.

let nextId = 7;

const DB = {
  posts: [
    { id: 1, content: "Launching our new product line today!", platform: "Instagram", createdAt: "2026-07-20T09:00:00Z" },
    { id: 2, content: "Thread: 5 lessons from scaling to 1M users.", platform: "Twitter", createdAt: "2026-07-20T11:30:00Z" },
    { id: 3, content: "Behind the scenes at our design studio.", platform: "LinkedIn", createdAt: "2026-07-21T08:15:00Z" },
    { id: 4, content: "Quick tip: batch your selectors.", platform: "Twitter", createdAt: "2026-07-21T14:00:00Z" },
    { id: 5, content: "Weekend reads from the engineering team.", platform: "LinkedIn", createdAt: "2026-07-22T10:00:00Z" },
    { id: 6, content: "New office, same great coffee.", platform: "Instagram", createdAt: "2026-07-22T16:45:00Z" }
  ],
  platforms: [
    { id: "Instagram", name: "Instagram" },
    { id: "Twitter", name: "Twitter" },
    { id: "LinkedIn", name: "LinkedIn" }
  ]
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPostsRequest() {
  await delay(600);
  // Uncomment to test the `rejected` branch of the thunk lifecycle:
  // throw new Error("Network error while fetching posts");
  return DB.posts.map((p) => ({ ...p }));
}

export async function fetchPlatformsRequest() {
  await delay(300);
  return DB.platforms.map((p) => ({ ...p }));
}

export async function createPostRequest(newPost) {
  await delay(400);
  const post = { id: nextId++, createdAt: new Date().toISOString(), ...newPost };
  DB.posts.push(post);
  return post;
}
