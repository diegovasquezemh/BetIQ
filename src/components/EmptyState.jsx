import { ClipboardList } from 'lucide-react'

export default function EmptyState({ onNewBet, hasFilters = false, onResetFilters }) {
  return (
    <div className="empty-state">
      <span><ClipboardList size={28} /></span>
      <h3>{hasFilters ? 'Sin coincidencias con los filtros' : 'Aún no tienes registros en tu bitácora'}</h3>
      <p>
        {hasFilters
          ? 'Prueba cambiando la búsqueda o restablece los filtros activos.'
          : 'Anota tu primer movimiento para empezar a calcular tu balance y ROI.'}
      </p>
      {hasFilters && onResetFilters ? (
        <button type="button" className="secondary-button" onClick={onResetFilters}>Limpiar filtros</button>
      ) : (
        <button type="button" className="secondary-button" onClick={onNewBet}>+ Nuevo registro</button>
      )}
    </div>
  )
}
