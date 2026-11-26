import { useState } from 'react'
import { Pencil, RotateCcw, Search, Trash2 } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { sports } from '../data/sampleBets.js'
import { formatDate, formatMoney, getBetProfit } from '../utils/betCalculations.js'

const statusFilters = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'won', label: 'Ganadas' },
  { id: 'lost', label: 'Perdidas' },
  { id: 'void', label: 'Anuladas' },
]

export default function History({ bets, onUpdateStatus, onEditBet, onDelete, onNewBet }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sportFilter, setSportFilter] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredBets = [...bets]
    .filter((bet) => status === 'all' || bet.status === status)
    .filter((bet) => sportFilter === 'all' || bet.sport === sportFilter)
    .filter((bet) =>
      [bet.event, bet.sport, bet.bookmaker, bet.selection, bet.market]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  const hasActiveFilters = query.trim() !== '' || status !== 'all' || sportFilter !== 'all'

  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setSportFilter('all')
  }

  return (
    <section className="panel history-panel">
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar partido, selección, deporte o casa..."
          />
        </label>

        <div className="filter-controls">
          <div className="status-pills" role="group" aria-label="Filtrar por estado">
            {statusFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter-pill ${status === item.id ? 'is-selected' : ''}`}
                onClick={() => setStatus(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="filter-subrow">
            <label className="compact-select">
              <span>Categoría</span>
              <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value)}>
                <option value="all">Todas</option>
                {sports.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
                <option value="Combinada">Combinada</option>
              </select>
            </label>

            {hasActiveFilters && (
              <button type="button" className="reset-filter-button" onClick={resetFilters}>
                <RotateCcw size={14} />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredBets.length ? (
        <div className="table-wrap history-table">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Jugada / Detalle</th>
                <th>Fecha</th>
                <th>Casa</th>
                <th>Monto</th>
                <th>Cuota</th>
                <th>Balance neto</th>
                <th>Estado</th>
                <th aria-label="Acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => {
                const profit = getBetProfit(bet)
                return (
                  <tr key={bet.id}>
                    <td className="cell-main">
                      <strong>{bet.event}</strong>
                      <small>
                        {bet.modality === 'COMBINADA' ? `Combinada (${bet.legs?.length || 2} selecciones)` : bet.sport}
                        {bet.moment === 'EN VIVO' ? ` · En vivo${bet.liveMinute ? ` (${bet.liveMinute})` : ''}` : ''}
                        {bet.selection ? ` · ${bet.selection}` : ''}
                        {bet.market && bet.modality !== 'COMBINADA' ? ` · ${bet.market}` : ''}
                      </small>
                    </td>
                    <td className="cell-half" data-label="Fecha">{formatDate(bet.date)}</td>
                    <td className="cell-half" data-label="Casa">{bet.bookmaker || '—'}</td>
                    <td className="cell-third" data-label="Monto">{formatMoney(bet.stake)}</td>
                    <td className="cell-third" data-label="Cuota">{Number(bet.odds).toFixed(2)}</td>
                    <td
                      className={`cell-third ${profit > 0 ? 'positive-text' : profit < 0 ? 'negative-text' : ''}`}
                      data-label="Balance"
                    >
                      {profit > 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                    </td>
                    <td className="cell-status" data-label="Estado">
                      <StatusBadge
                        status={bet.status}
                        onChange={(nextStatus) => onUpdateStatus(bet.id, nextStatus)}
                        ariaLabel={`Cambiar estado de ${bet.event}`}
                      />
                    </td>
                    <td className="cell-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-icon-button"
                          onClick={() => onEditBet(bet)}
                          title="Editar registro"
                          aria-label={`Editar ${bet.event}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-button danger"
                          onClick={() => onDelete(bet.id)}
                          title="Eliminar registro"
                          aria-label={`Eliminar ${bet.event}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState onNewBet={onNewBet} hasFilters={hasActiveFilters} onResetFilters={resetFilters} />
      )}
    </section>
  )
}
