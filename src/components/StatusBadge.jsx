import { statusLabels } from '../data/sampleBets.js'

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>
}
