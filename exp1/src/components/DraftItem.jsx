import { platforms } from '../utils/validationStrategies'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DraftItem({ draft, onEdit, onDelete }) {
  const strategy = platforms[draft.platform] || {}
  const preview = draft.content.length > 140 ? `${draft.content.slice(0, 140)}…` : draft.content

  return (
    <li className="draft-item">
      <div className="draft-item__meta">
        <span className="draft-item__platform" style={{ color: strategy.color }}>
          <span className="platform-chip__dot" style={{ background: strategy.color }} />
          {strategy.label || draft.platform}
        </span>
        <span className="draft-item__time">{formatTime(draft.updatedAt)}</span>
      </div>
      <p className="draft-item__preview">{preview}</p>
      <div className="draft-item__actions">
        <button className="link-btn" onClick={() => onEdit(draft)}>Edit</button>
        <button className="link-btn link-btn--danger" onClick={() => onDelete(draft.id)}>Delete</button>
      </div>
    </li>
  )
}

export default DraftItem
