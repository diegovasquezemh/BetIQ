import { Activity, CircleDollarSign, Crosshair, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate, formatMoney, getBetProfit, getSummary } from '../utils/betCalculations.js'

export default function Dashboard({ bets, onNavigate }) {
  const summary = getSummary(bets)
  const recent = [...bets].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const maxStake = Math.max(...bets.map((bet) => Number(bet.stake)), 1)

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="hero-pill">BET + IQ</span>
          <h2>Convierte tus movimientos<br />en decisiones <em>inteligentes.</em></h2>
          <p>Registra, compara y entiende cómo se comportan tus apuestas.</p>
          <button className="light-button" onClick={() => onNavigate('new-bet')}>Registrar movimiento</button>
        </div>
        <div className="hero-score" aria-label={`Retorno de inversión ${summary.roi.toFixed(1)} por ciento`}>
          <span>ROI ACTUAL</span>
          <strong>{summary.roi >= 0 ? '+' : ''}{summary.roi.toFixed(1)}%</strong>
          <small>{summary.total} apuestas registradas</small>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicadores principales">
        <StatCard
          label="Balance neto"
          value={formatMoney(summary.profit)}
          detail="Solo apuestas finalizadas"
          icon={CircleDollarSign}
          tone={summary.profit >= 0 ? 'positive' : 'negative'}
        />
        <StatCard label="Capital apostado" value={formatMoney(summary.invested)} detail="Total finalizado" icon={Activity} />
        <StatCard label="Tasa de acierto" value={`${summary.hitRate.toFixed(0)}%`} detail="Ganadas vs. finalizadas" icon={Crosshair} />
        <StatCard label="Pendientes" value={summary.pending} detail="Resultados por actualizar" icon={TrendingUp} />
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">EXPOSICIÓN</p>
              <h3>Monto por apuesta</h3>
            </div>
            <span className="chart-legend"><i /> Capital</span>
          </div>
          <div className="bar-chart" aria-label="Gráfico de monto por apuesta">
            {bets.slice(-7).map((bet) => (
              <div className="bar-column" key={bet.id}>
                <span className="bar-value">${bet.stake}</span>
                <div className="bar-track">
                  <span style={{ height: `${Math.max((bet.stake / maxStake) * 100, 8)}%` }} />
                </div>
                <small>{bet.sport.slice(0, 3)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel insight-panel">
          <p className="eyebrow">INSIGHT BETIQ</p>
          <h3>{summary.hitRate >= 50 ? 'Tu registro va tomando forma.' : 'Cada resultado mejora tu análisis.'}</h3>
          <p>
            {summary.pending
              ? `Tienes ${summary.pending} apuesta${summary.pending > 1 ? 's' : ''} pendiente${summary.pending > 1 ? 's' : ''}. Actualízalas para obtener un ROI más preciso.`
              : 'Todos tus resultados están actualizados. Mantén el hábito de registrar cada apuesta.'}
          </p>
          <button className="text-button" onClick={() => onNavigate('history')}>Revisar historial →</button>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ÚLTIMOS MOVIMIENTOS</p>
            <h3>Apuestas recientes</h3>
          </div>
          <button className="text-button" onClick={() => onNavigate('history')}>Ver historial →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Evento</th><th>Fecha</th><th>Monto</th><th>Cuota</th><th>Resultado</th><th>Ganancia</th></tr></thead>
            <tbody>
              {recent.map((bet) => (
                <tr key={bet.id}>
                  <td>
                    <strong>{bet.modality === 'COMBINADA' ? `Combinada de ${bet.legs?.length || 2} selecciones` : bet.event}</strong>
                    <small>{bet.modality || 'SIMPLE'} · {bet.moment || 'ANTES DEL EVENTO'} · {bet.selection}</small>
                  </td>
                  <td>{formatDate(bet.date)}</td>
                  <td>{formatMoney(bet.stake)}</td>
                  <td>{Number(bet.odds).toFixed(2)}</td>
                  <td><StatusBadge status={bet.status} /></td>
                  <td className={getBetProfit(bet) > 0 ? 'positive-text' : getBetProfit(bet) < 0 ? 'negative-text' : ''}>
                    {formatMoney(getBetProfit(bet))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
