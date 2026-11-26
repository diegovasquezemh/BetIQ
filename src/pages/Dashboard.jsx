import { Activity, CircleDollarSign, Crosshair, Pencil, Trash2, TrendingUp } from 'lucide-react'
import BookmakerPerformance from '../components/BookmakerPerformance.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatMoney, getBetProfit, getSummary } from '../utils/betCalculations.js'

export default function Dashboard({ bets, onNavigate, onEditBet, onUpdateStatus, onDelete }) {
  const summary = getSummary(bets)
  const sortedByDateDesc = [...bets].sort((a, b) => b.date.localeCompare(a.date))
  const recent = sortedByDateDesc.slice(0, 5)
  const chartBets = [...sortedByDateDesc].slice(0, 7).reverse()
  const maxStake = Math.max(...chartBets.map((bet) => Number(bet.stake)), 1)

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-top-row">
            <span className="hero-pill">BITÁCORA PERSONAL</span>
            <span className="hero-mobile-roi">
              ROI: <strong>{summary.roi >= 0 ? '+' : ''}{summary.roi.toFixed(1)}%</strong>
            </span>
          </div>
          <h2>Lleva el registro claro<br />de cada <em>jugada.</em></h2>
          <p>Anota tus movimientos en segundos, corrige cualquier dato cuando quieras y consulta tu rendimiento real.</p>
        </div>
        <div className="hero-score" aria-label={`Retorno de inversión ${summary.roi.toFixed(1)} por ciento`}>
          <span>ROI ACTUAL</span>
          <strong>{summary.roi >= 0 ? '+' : ''}{summary.roi.toFixed(1)}%</strong>
          <small>{summary.total} {summary.total === 1 ? 'registro' : 'registros'}</small>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicadores principales">
        <StatCard
          label="Balance neto"
          value={formatMoney(summary.profit)}
          detail="Ganancia o pérdida"
          icon={CircleDollarSign}
          tone={summary.profit >= 0 ? 'positive' : 'negative'}
        />
        <StatCard label="Total arriesgado" value={formatMoney(summary.invested)} detail="Jugadas finalizadas" icon={Activity} />
        <StatCard label="Efectividad" value={`${summary.hitRate.toFixed(0)}%`} detail="Ganadas vs. finalizadas" icon={Crosshair} />
        <StatCard label="Por resolver" value={summary.pending} detail="Jugadas pendientes" icon={TrendingUp} />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">HISTORIAL RECIENTE</p>
              <h3>Monto por registro</h3>
            </div>
            <span className="chart-legend"><i /> Monto (USD)</span>
          </div>
          <div className="bar-chart" aria-label="Gráfico de monto por registro">
            {chartBets.map((bet) => (
              <div className="bar-column" key={bet.id} title={`${bet.event} (${formatMoney(bet.stake)})`}>
                <span className="bar-value">${Number(bet.stake)}</span>
                <div className="bar-track">
                  <span style={{ height: `${Math.max((Number(bet.stake) / maxStake) * 100, 8)}%` }} />
                </div>
                <small>{bet.sport.slice(0, 3)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel insight-panel">
          <p className="eyebrow">ESTADO DE TU BITÁCORA</p>
          <h3>{summary.pending ? 'Tienes registros pendientes.' : 'Tu bitácora está al día.'}</h3>
          <p>
            {summary.pending
              ? `Hay ${summary.pending} jugada${summary.pending > 1 ? 's' : ''} pendiente${summary.pending > 1 ? 's' : ''}. Cambia su resultado directamente en la lista inferior.`
              : 'Todos tus registros tienen resultado asignado. Puedes cambiar el estado o editar cualquier dato cuando quieras.'}
          </p>
          <button type="button" className="text-button" onClick={() => onNavigate('history')}>Ver todos los registros →</button>
        </article>
      </section>

      <BookmakerPerformance bets={bets} onHistory={() => onNavigate('history')} />

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ACCIONES RÁPIDAS</p>
            <h3>Últimos registros</h3>
          </div>
          <button type="button" className="text-button" onClick={() => onNavigate('history')}>Ver todos ({bets.length}) →</button>
        </div>
        <div className="table-wrap">
          <table className="responsive-table dashboard-table">
            <thead>
              <tr>
                <th>Jugada / Selección</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Cuota</th>
                <th>Balance</th>
                <th>Estado</th>
                <th aria-label="Acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((bet) => {
                const profit = getBetProfit(bet)
                return (
                  <tr key={bet.id}>
                    <td className="cell-main">
                      <strong>{bet.event}</strong>
                      <small>
                        {bet.modality === 'COMBINADA' ? `Combinada (${bet.legs?.length || 2})` : bet.sport}
                        {bet.moment === 'EN VIVO' ? ' · En vivo' : ''}
                        {bet.selection ? ` · ${bet.selection}` : ''}
                        {bet.bookmaker ? ` · ${bet.bookmaker}` : ''}
                      </small>
                    </td>
                    <td className="cell-half" data-label="Fecha">{formatDate(bet.date)}</td>
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
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-button danger"
                          onClick={() => onDelete(bet.id)}
                          title="Eliminar registro"
                          aria-label={`Eliminar ${bet.event}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
