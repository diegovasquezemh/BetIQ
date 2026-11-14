import { ClipboardList } from 'lucide-react'

export default function EmptyState({ onNewBet }) {
  return (
    <div className="empty-state">
      <span><ClipboardList size={28} /></span>
      <h3>No encontramos apuestas</h3>
      <p>Cambia los filtros o registra tu primer movimiento.</p>
      <button className="secondary-button" onClick={onNewBet}>Registrar apuesta</button>
    </div>
  )
}
