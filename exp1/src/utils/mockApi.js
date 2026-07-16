// ---------------------------------------------------------------------------
// Mock API -- simulates network latency + occasional failure so the UI has
// something real to handle (loading / error / success + retry).
// ---------------------------------------------------------------------------

function saveDraftRequest(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data || !data.content || data.content.trim().length === 0) {
        reject(new Error('Invalid data: content is empty.'))
        return
      }
      // Small random failure chance so retry logic has something to prove.
      if (Math.random() < 0.15) {
        reject(new Error('Network hiccup while saving draft.'))
        return
      }
      resolve({ success: true, id: data.id, savedAt: new Date().toISOString() })
    }, 700)
  })
}

// Fault-tolerant retry wrapper (Section 9, Retry Logic Patterns).
export async function retry(fn, retries = 3, delayMs = 400) {
  try {
    return await fn()
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delayMs))
      return retry(fn, retries - 1, delayMs)
    }
    throw err
  }
}

export async function saveDraftMock(data, { retries = 2 } = {}) {
  return retry(() => saveDraftRequest(data), retries)
}
