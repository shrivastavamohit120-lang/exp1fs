import DraftItem from './DraftItem'
import { useToast } from '../hooks/useToast.jsx'

function DraftList({ drafts, onEdit, onDelete }) {
  const toast = useToast()

  const handleDelete = (id) => {
    onDelete(id)
    toast.info('Draft deleted.')
  }

  return (
    <section className="card drafts">
      <div className="drafts__header">
        <h2>Drafts</h2>
        <span className="drafts__count">{drafts.length}</span>
      </div>

      {drafts.length === 0 ? (
        <div className="drafts__empty">
          <p>Nothing saved yet.</p>
          <p className="drafts__empty-sub">Write a post and save it — it'll show up here.</p>
        </div>
      ) : (
        <ul className="drafts__list">
          {drafts.map((d) => (
            <DraftItem key={d.id} draft={d} onEdit={onEdit} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default DraftList
