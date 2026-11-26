import { useState } from 'react'
import { formatMoney, getBookmakerPerformance } from '../utils/betCalculations.js'

export default function BookmakerPerformance({ bets, onHistory }) {
  const [expanded, setExpanded] = useState(false)
  const performance = getBookmakerPerformance(bets)
  const rows = performance.rows
  const withoutBookmaker = performance.withoutBookmaker
  const visible = expanded ? rows : rows.slice(0, 3)

  return (
    <section className="panel chart-panel bookmaker-panel" aria-labelledby="bookmaker-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PLATAFORMAS</p>
          <h3 id="bookmaker-heading">Rendimiento por casa</h3>
        </div>
        {rows.length > 3 && (
          <button
            type="button"
            className="text-button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ver menos' : `Ver todas (${rows.length})`}
          </button>
        )}
      </div>

      {rows.length > 0 ? (
        <>
          <p className="bookmaker-note">
            Tus casas, de mayor a menor balance neto. Cuentan las apuestas ganadas y perdidas.
          </p>
          <div className="bookmaker-scroll">
            <table className="bookmaker-table" aria-labelledby="bookmaker-heading">
              <thead>
                <tr>
                  <th scope="col">Casa</th>
                  <th scope="col">Balance</th>
                  <th scope="col">ROI</th>
                  <th scope="col">Resueltas</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.name}>
                    <th scope="row">{row.name}</th>
                    <td className={row.balance > 0 ? 'positive-text' : row.balance < 0 ? 'negative-text' : ''}>
                      {row.balance > 0 ? '+' : ''}
                      {formatMoney(row.balance || 0)}
                    </td>
                    <td>{row.roi.toFixed(1)}%</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="bookmaker-note">
          Cuando tengas una apuesta ganada o perdida con una casa indicada, aquí verás su balance y su ROI.
        </p>
      )}

      {withoutBookmaker > 0 && (
        <p className="bookmaker-missing">
          {withoutBookmaker === 1
            ? 'Hay una apuesta resuelta sin casa asignada.'
            : `Hay ${withoutBookmaker} apuestas resueltas sin casa asignada.`}{' '}
          <button type="button" className="text-button" onClick={onHistory}>
            Revisar registros
          </button>
        </p>
      )}
    </section>
  )
}
