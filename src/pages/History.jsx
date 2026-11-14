import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatMoney, getBetProfit } from '../utils/betCalculations.js'

export default function History({ bets, onUpdateStatus, onDelete, onNewBet }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredBets = [...bets]
    .filter((bet) => status === 'all' || bet.status === status)
    .filter((bet) => [bet.event, bet.sport, bet.bookmaker, bet.selection].join(' ').toLowerCase().includes(normalizedQuery))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section className="panel history-panel">
      <div className="filter-bar">
        <label className="search-field">
          <Search size={18} />
          <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar evento, deporte o casa..." />
        </label>
        <label className="compact-select">
          <span>Mostrar</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="won">Ganadas</option>
            <option value="lost">Perdidas</option>
            <option value="void">Anuladas</option>
          </select>
        </label>
      </div>

      {filteredBets.length ? (
        <div className="table-wrap history-table">
          <table>
            <thead><tr><th>Evento</th><th>Fecha</th><th>Casa</th><th>Monto</th><th>Cuota</th><th>Estado</th><th>Retorno neto</th><th aria-label="Acciones" /></tr></thead>
            <tbody>
              {filteredBets.map((bet) => (
                <tr key={bet.id}>
                  <td>
                    <strong>{bet.modality === 'COMBINADA' ? `Combinada de ${bet.legs?.length || 2} selecciones` : bet.event}</strong>
                    <small>{bet.modality || 'SIMPLE'} · {bet.moment || 'ANTES DEL EVENTO'} · {bet.selection}</small>
                  </td>
                  <td>{formatDate(bet.date)}</td>
                  <td>{bet.bookmaker}</td>
                  <td>{formatMoney(bet.stake)}</td>
                  <td>{Number(bet.odds).toFixed(2)}</td>
                  <td>
                    {bet.status === 'pending' ? (
                      <select className="status-select" value={bet.status} onChange={(event) => onUpdateStatus(bet.id, event.target.value)} aria-label={`Actualizar ${bet.event}`}>
                        <option value="pending">Pendiente</option>
                        <option value="won">Ganada</option>
                        <option value="lost">Perdida</option>
                        <option value="void">Anulada</option>
                      </select>
                    ) : <StatusBadge status={bet.status} />}
                  </td>
                  <td className={getBetProfit(bet) > 0 ? 'positive-text' : getBetProfit(bet) < 0 ? 'negative-text' : ''}>{formatMoney(getBetProfit(bet))}</td>
                  <td><button className="delete-button" onClick={() => onDelete(bet.id)} aria-label={`Eliminar ${bet.event}`}><Trash2 size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState onNewBet={onNewBet} />}
    </section>
  )
}
