import { formatMoney } from './betCalculations.js'

// La categoría destacada explica el balance en dólares del mismo historial que la tabla.
export function getCapitalInsight(categories, summary) {
  const count = categories.reduce((total, item) => total + item.count, 0)
  if (!count) {
    return {
      title: 'Aún no hay resultados para analizar',
      detail: 'Al marcar tu primera jugada como ganada o perdida, aquí verás cómo afectó tu balance.',
    }
  }

  const balance = Number(summary.profit.toFixed(2))
  const sample = count === 1 ? '1 jugada resuelta' : count + ' jugadas resueltas'
  const context = 'Monto arriesgado: ' + formatMoney(summary.invested) + ' en ' + sample + '.'

  if (balance === 0) {
    return {
      title: 'Tu balance está en equilibrio',
      detail: 'Las ganancias y pérdidas de este historial suman ' + formatMoney(0) + ' netos. ' + context,
    }
  }

  const positive = balance > 0
  const amounts = categories.map((item) => Number(item.profit.toFixed(2)))
  const extreme = positive ? Math.max(...amounts) : Math.min(...amounts)
  const leaders = categories.filter((_, index) => amounts[index] === extreme)
  const strongest = leaders[0]
  const movement = positive ? 'aportó' : 'restó'
  let detail = ''

  if (leaders.length === 1) {
    const sampleNote = strongest.count === 1 ? 'una sola jugada' : strongest.count + ' jugadas'
    detail = strongest.sport + ' ' + movement + ' ' + formatMoney(Math.abs(extreme)) + ' en ' + sampleNote + '.'
  } else {
    detail =
      leaders.map((item) => item.sport).join(' y ') +
      ' empatan en la mayor ' +
      (positive ? 'ganancia' : 'pérdida') +
      ' neta por categoría, con ' +
      formatMoney(Math.abs(extreme)) +
      ' cada una.'
  }

  return {
    title: 'Tu balance es de ' + (positive ? '+' : '') + formatMoney(balance),
    detail: detail + ' ' + context,
  }
}
