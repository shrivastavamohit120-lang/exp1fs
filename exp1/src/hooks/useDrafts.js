import { useState, useEffect, useCallback } from 'react'
import { saveDraftMock } from '../utils/mockApi'

const STORAGE_KEY = 'signal.drafts.v1'

function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Encapsulates draft CRUD + persistence + the async save lifecycle, so
// components stay purely presentational (Section 2 rationale: reusability,
// cleaner components, separation of concerns).
export function useDrafts() {
  const [drafts, setDrafts] = useState(loadFromStorage)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  }, [drafts])

  const saveDraft = useCallback(async ({ id, platform, content }) => {
    setSaving(true)
    setSaveError('')
    const draftId = id || `draft_${Date.now()}`

    try {
      await saveDraftMock({ id: draftId, content })
      setDrafts((prev) => {
        const existingIndex = prev.findIndex((d) => d.id === draftId)
        const nextDraft = {
          id: draftId,
          platform,
          content,
          updatedAt: new Date().toISOString(),
        }
        if (existingIndex >= 0) {
          const copy = [...prev]
          copy[existingIndex] = nextDraft
          return copy
        }
        return [nextDraft, ...prev]
      })
      setSaving(false)
      return { success: true, id: draftId }
    } catch (err) {
      setSaveError(err.message || 'Failed to save draft.')
      setSaving(false)
      return { success: false, error: err.message }
    }
  }, [])

  const deleteDraft = useCallback((id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return { drafts, saveDraft, deleteDraft, saving, saveError }
}
