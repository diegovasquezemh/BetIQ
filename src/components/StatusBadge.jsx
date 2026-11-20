import { statusLabels } from '../data/sampleBets.js'

export default function StatusBadge({ status, onChange, ariaLabel = 'Cambiar estado' }) {
  if (onChange) {
    return (
      <select
        className={`status-select status-${status}`}
        value={status}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      >
        <option value="pending">Pendiente</option>
        <option value="won">Ganada</option>
        <option value="lost">Perdida</option>
        <option value="void">Anulada</option>
      </select>
    )
  }

  return <span className={`status-badge status-${status}`}>{statusLabels[status] || status}</span>
}
