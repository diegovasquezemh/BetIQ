const VALID_BET_TYPES = ['SIMPLE', 'COMBINADA', 'EN VIVO']

// Las tres funciones siguientes implementan directamente el pseudocódigo
// presentado por el equipo en el documento BetIQ_Funciones.
export function EsApuestaValida(tipo, monto, cuota) {
  return VALID_BET_TYPES.includes(tipo) && Number(monto) > 0 && Number(cuota) > 1
}

export function CalcularResultado(monto, cuota, gano) {
  if (gano) {
    return Number(monto) * Number(cuota) - Number(monto)
  }
  return -Number(monto)
}

export function CalcularROI(resultados, montos) {
  const totalApostado = montos.reduce((total, monto) => total + Number(monto), 0)

  if (totalApostado === 0) {
    return 0
  }

  const totalResultados = resultados.reduce((total, resultado) => total + Number(resultado), 0)
  return (totalResultados / totalApostado) * 100
}

export function getBetProfit(bet) {
  if (bet.status === 'won') {
    return CalcularResultado(bet.stake, bet.odds, true)
  }
  if (bet.status === 'lost') {
    return CalcularResultado(bet.stake, bet.odds, false)
  }
  return 0
}

export function getSummary(bets) {
  const settled = bets.filter((bet) => bet.status === 'won' || bet.status === 'lost')
  const invested = settled.reduce((total, bet) => total + Number(bet.stake), 0)
  const profit = settled.reduce((total, bet) => total + getBetProfit(bet), 0)
  const wins = settled.filter((bet) => bet.status === 'won').length
  const results = settled.map(getBetProfit)
  const stakes = settled.map((bet) => bet.stake)

  return {
    invested: invested,
    profit: profit,
    roi: CalcularROI(results, stakes),
    hitRate: settled.length ? (wins / settled.length) * 100 : 0,
    total: bets.length,
    pending: bets.filter((bet) => bet.status === 'pending').length,
  }
}

export function formatMoney(value) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function getBookmakerPerformance(bets) {
  const groups = {}
  const keys = []
  let withoutBookmaker = 0

  for (let i = 0; i < bets.length; i++) {
    const bet = bets[i]
    if (bet.status !== 'won' && bet.status !== 'lost') {
      continue
    }

    const rawName = typeof bet.bookmaker === 'string' ? bet.bookmaker.trim() : ''
    const cleanName = rawName.split(/\s+/).filter(Boolean).join(' ')
    const key = cleanName.toLowerCase()

    // El formulario guarda «Personal» cuando se deja la casa en blanco.
    if (!key || key === 'personal') {
      withoutBookmaker++
      continue
    }

    if (!groups[key]) {
      groups[key] = { name: cleanName, bets: [] }
      keys.push(key)
    }
    groups[key].bets.push(bet)
  }

  const rows = keys.map((key) => {
    const group = groups[key]
    const summary = getSummary(group.bets)
    return {
      name: group.name,
      balance: Number(summary.profit.toFixed(2)),
      roi: summary.roi,
      count: summary.total,
    }
  })

  rows.sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name, 'es'))
  return { rows: rows, withoutBookmaker: withoutBookmaker }
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}
