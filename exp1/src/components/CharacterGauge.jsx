function CharacterGauge({ length, limit, color }) {
  const pct = Math.min(length / limit, 1)
  const remaining = limit - length
  let state = 'ok'
  if (pct >= 1) state = 'over'
  else if (pct >= 0.9) state = 'warn'

  const barColor = state === 'over' ? '#E24C4C' : state === 'warn' ? '#E8A33D' : color

  return (
    <div className="gauge">
      <div className="gauge__track">
        <div
          className={`gauge__fill gauge__fill--${state}`}
          style={{ width: `${pct * 100}%`, background: barColor }}
        />
        <div className="gauge__ticks">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="gauge__tick" />
          ))}
        </div>
      </div>
      <div className="gauge__readout">
        <span className={`gauge__count gauge__count--${state}`}>
          {length} / {limit}
        </span>
        <span className="gauge__remaining">
          {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
        </span>
      </div>
    </div>
  )
}

export default CharacterGauge
