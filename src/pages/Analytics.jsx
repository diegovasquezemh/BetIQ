import { Award, CircleAlert, Goal, Scale } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import { formatMoney, getBetProfit, getSummary } from '../utils/betCalculations.js'
import { getCapitalInsight } from '../utils/capitalInsight.js'

export default function Analytics({ bets }) {
  const summary = getSummary(bets)
  const settled = bets.filter((bet) => ['won', 'lost'].includes(bet.status))
  const grouped = settled.reduce((result, bet) => {
    const sportName = bet.sport || 'Otro'
    const current = result[sportName] || { sport: sportName, count: 0, invested: 0, profit: 0 }
    current.count += 1
    current.invested += Number(bet.stake)
    current.profit += getBetProfit(bet)
    result[sportName] = current
    return result
  }, {})
  const sportsData = Object.values(grouped).sort((a, b) => b.invested - a.invested)
  const insight = getCapitalInsight(sportsData, summary)
  const maxInvested = Math.max(...sportsData.map((item) => item.invested), 1)
  const biggestWin = Math.max(0, ...settled.map(getBetProfit))
  const averageStake = bets.length
    ? bets.reduce((total, bet) => total + Number(bet.stake), 0) / bets.length
    : 0

  return (
    <div className="page-stack">
      <section className="stats-grid analytics-stats">
        <StatCard
          label="ROI global"
          value={`${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%`}
          detail="Retorno sobre lo arriesgado"
          icon={Goal}
          tone={summary.roi >= 0 ? 'positive' : 'negative'}
        />
        <StatCard label="Mayor ganancia" value={formatMoney(biggestWin)} detail="En un solo registro" icon={Award} />
        <StatCard label="Monto promedio" value={formatMoney(averageStake)} detail="Promedio de tu bitácora" icon={Scale} />
        <StatCard label="Jugadas resueltas" value={settled.length} detail="Con resultado definido" icon={CircleAlert} />
      </section>

      <section className="analytics-grid">
        <article className="panel sport-analysis">
          <div className="panel-heading">
            <div><p className="eyebrow">RENDIMIENTO</p><h3>Balance y ROI por categoría</h3></div>
          </div>
          {sportsData.length ? (
            <div className="sport-list">
              {sportsData.map((item) => {
                const roi = item.invested ? (item.profit / item.invested) * 100 : 0
                return (
                  <div className="sport-row" key={item.sport}>
                    <div className="sport-meta">
                      <strong>{item.sport}</strong>
                      <small>{item.count} registro{item.count !== 1 ? 's' : ''} · {formatMoney(item.invested)}</small>
                    </div>
                    <div className="sport-bar">
                      <span style={{ width: `${Math.max((item.invested / maxInvested) * 100, 5)}%` }} />
                    </div>
                    <strong className={roi >= 0 ? 'positive-text' : 'negative-text'}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </strong>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="muted-copy">Marca algunos registros como Ganada o Perdida para comparar tu rendimiento por categoría.</p>
          )}
        </article>

        <article className="panel health-card" aria-label="Gestión de capital">
          <span className="health-mark">BET<span>IQ</span></span>
          <p className="eyebrow">GESTIÓN DE CAPITAL</p>
          <h3>{insight.title}</h3>
          <p>{insight.detail}</p>
          {settled.length > 0 && (
            <>
              <p className="capital-hit-rate">
                Porcentaje de aciertos <strong>{summary.hitRate.toFixed(0)} %</strong>
              </p>
              <div className="health-meter" aria-hidden="true">
                <span style={{ width: `${summary.hitRate}%` }} />
              </div>
            </>
          )}
        </article>
      </section>

      <section className="panel formula-panel">
        <div>
          <p className="eyebrow">FÓRMULA DE LA BITÁCORA</p>
          <h3>ROI = ganancia neta ÷ monto arriesgado × 100</h3>
        </div>
        <p>BetIQ calcula el retorno únicamente sobre jugadas marcadas como Ganada o Perdida. Las pendientes o anuladas no distorsionan tus estadísticas.</p>
      </section>
    </div>
  )
}
