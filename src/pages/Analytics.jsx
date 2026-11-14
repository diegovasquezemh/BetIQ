import { Award, CircleAlert, Goal, Scale } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { formatMoney, getBetProfit, getSummary } from '../utils/betCalculations.js'

export default function Analytics({ bets }) {
  const summary = getSummary(bets)
  const settled = bets.filter((bet) => ['won', 'lost'].includes(bet.status))
  const grouped = settled.reduce((result, bet) => {
    const current = result[bet.sport] || { sport: bet.sport, count: 0, invested: 0, profit: 0 }
    current.count += 1
    current.invested += bet.stake
    current.profit += getBetProfit(bet)
    result[bet.sport] = current
    return result
  }, {})
  const sportsData = Object.values(grouped).sort((a, b) => b.invested - a.invested)
  const maxInvested = Math.max(...sportsData.map((item) => item.invested), 1)
  const biggestWin = Math.max(0, ...settled.map(getBetProfit))
  const averageStake = bets.length ? bets.reduce((total, bet) => total + bet.stake, 0) / bets.length : 0

  return (
    <div className="page-stack">
      <section className="stats-grid analytics-stats">
        <StatCard label="ROI global" value={`${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%`} detail="Retorno sobre lo invertido" icon={Goal} tone={summary.roi >= 0 ? 'positive' : 'negative'} />
        <StatCard label="Mayor ganancia" value={formatMoney(biggestWin)} detail="En una sola apuesta" icon={Award} />
        <StatCard label="Apuesta promedio" value={formatMoney(averageStake)} detail="Promedio de tu historial" icon={Scale} />
        <StatCard label="Muestra analizada" value={settled.length} detail="Apuestas finalizadas" icon={CircleAlert} />
      </section>

      <section className="analytics-grid">
        <article className="panel sport-analysis">
          <div className="panel-heading">
            <div><p className="eyebrow">RENDIMIENTO</p><h3>Resultados por deporte</h3></div>
          </div>
          {sportsData.length ? (
            <div className="sport-list">
              {sportsData.map((item) => {
                const roi = item.invested ? (item.profit / item.invested) * 100 : 0
                return (
                  <div className="sport-row" key={item.sport}>
                    <div className="sport-meta"><strong>{item.sport}</strong><small>{item.count} apuesta{item.count !== 1 ? 's' : ''}</small></div>
                    <div className="sport-bar"><span style={{ width: `${Math.max((item.invested / maxInvested) * 100, 5)}%` }} /></div>
                    <strong className={roi >= 0 ? 'positive-text' : 'negative-text'}>{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</strong>
                  </div>
                )
              })}
            </div>
          ) : <p className="muted-copy">Finaliza algunas apuestas para comparar tu rendimiento.</p>}
        </article>

        <article className="panel health-card">
          <span className="health-mark">BET<span>IQ</span></span>
          <p className="eyebrow">SALUD DE TUS APUESTAS</p>
          <h3>El control empieza con límites claros.</h3>
          <div className="health-meter"><span style={{ width: `${Math.min(Math.max(summary.hitRate, 10), 100)}%` }} /></div>
          <p>Tu tasa de acierto es una medida histórica, no una garantía de resultados futuros.</p>
          <ul>
            <li>Define un presupuesto antes de apostar.</li>
            <li>No persigas pérdidas aumentando el monto.</li>
            <li>Haz pausas cuando apostar deje de ser entretenido.</li>
          </ul>
        </article>
      </section>

      <section className="panel formula-panel">
        <div><p className="eyebrow">CÓMO LO CALCULAMOS</p><h3>ROI = ganancia neta ÷ capital apostado × 100</h3></div>
        <p>BetIQ considera únicamente las apuestas ganadas y perdidas. Las pendientes o anuladas no alteran el cálculo.</p>
      </section>
    </div>
  )
}
