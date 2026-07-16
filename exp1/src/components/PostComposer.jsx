import { useState, useEffect, useMemo } from 'react'
import { useForm } from '../hooks/useForm'
import { platforms, validateForPlatform } from '../utils/validationStrategies'
import CharacterGauge from './CharacterGauge'
import PlatformSelector from './PlatformSelector'
import { useToast } from '../hooks/useToast.jsx'

function PostComposer({ saveDraft, saving, editingDraft, onDoneEditing }) {
  const [platform, setPlatform] = useState('twitter')
  const content = useForm('')
  const toast = useToast()
  const [touched, setTouched] = useState(false)

  // Load a draft into the composer when "Edit" is clicked in the list.
  useEffect(() => {
    if (editingDraft) {
      setPlatform(editingDraft.platform)
      content.setValue(editingDraft.content)
      setTouched(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDraft])

  const strategy = platforms[platform]
  const error = useMemo(
    () => validateForPlatform(platform, content.value),
    [platform, content.value],
  )

  const canSave = touched ? !error : content.value.trim().length > 0 && !error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (error) {
      toast.error(error)
      return
    }
    const result = await saveDraft({
      id: editingDraft?.id,
      platform,
      content: content.value,
    })
    if (result.success) {
      toast.success(editingDraft ? 'Draft updated.' : 'Draft saved.')
      content.reset()
      setTouched(false)
      onDoneEditing?.()
    } else {
      toast.error(result.error || 'Could not save draft after retries.')
    }
  }

  return (
    <section className="composer card">
      <div className="composer__header">
        <h2>Compose</h2>
        {editingDraft && (
          <button type="button" className="link-btn" onClick={onDoneEditing}>
            Cancel edit
          </button>
        )}
      </div>

      <PlatformSelector selected={platform} onSelect={setPlatform} />

      <p className="composer__hint">{strategy.hint}</p>

      <form onSubmit={handleSubmit}>
        <textarea
          className={`composer__textarea ${touched && error ? 'composer__textarea--error' : ''}`}
          value={content.value}
          onChange={(e) => {
            setTouched(true)
            content.handleChange(e)
          }}
          placeholder={`Write your ${strategy.label} post...`}
          rows={8}
        />

        <CharacterGauge length={content.value.length} limit={strategy.limit} color={strategy.color} />

        {touched && error && <p className="composer__error">{error}</p>}

        <div className="composer__actions">
          <button type="submit" className="btn btn--primary" disabled={!canSave || saving}>
            {saving ? 'Saving…' : editingDraft ? 'Update draft' : 'Save draft'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostComposer
