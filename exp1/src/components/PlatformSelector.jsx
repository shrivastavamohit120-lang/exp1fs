import { platformList } from '../utils/validationStrategies'

function PlatformSelector({ selected, onSelect }) {
  return (
    <div className="platform-selector" role="tablist" aria-label="Choose platform">
      {platformList.map((p) => {
        const isActive = p.key === selected
        return (
          <button
            key={p.key}
            role="tab"
            aria-selected={isActive}
            className={`platform-chip ${isActive ? 'platform-chip--active' : ''}`}
            style={isActive ? { borderColor: p.color, color: p.color } : undefined}
            onClick={() => onSelect(p.key)}
          >
            <span className="platform-chip__dot" style={{ background: p.color }} />
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

export default PlatformSelector
