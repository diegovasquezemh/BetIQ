const VALID_BET_TYPES = ['SIMPLE', 'COMBINADA', 'EN VIVO']

// Las tres funciones siguientes implementan directamente el pseudocódigo
// presentado por el equipo en el documento BetIQ_Funciones.
export const EsApuestaValida = (tipo, monto, cuota) =>
  VALID_BET_TYPES.includes(tipo) && Number(monto) > 0 && Number(cuota) > 1

export const CalcularResultado = (monto, cuota, gano) =>
  gano ? Number(monto) * Number(cuota) - Number(monto) : -Number(monto)

export const CalcularROI = (resultados, montos) => {
  const totalApostado = montos.reduce((total, monto) => total + Number(monto), 0)

  if (totalApostado === 0) return 0

  const totalResultados = resultados.reduce((total, resultado) => total + Number(resultado), 0)
  return (totalResultados / totalApostado) * 100
}

export const getBetProfit = (bet) => {
  if (bet.status === 'won') return CalcularResultado(bet.stake, bet.odds, true)
  if (bet.status === 'lost') return CalcularResultado(bet.stake, bet.odds, false)
  return 0
}

export const getSummary = (bets) => {
  const settled = bets.filter((bet) => ['won', 'lost'].includes(bet.status))
  const invested = settled.reduce((total, bet) => total + Number(bet.stake), 0)
  const profit = settled.reduce((total, bet) => total + getBetProfit(bet), 0)
  const wins = settled.filter((bet) => bet.status === 'won').length
  const results = settled.map(getBetProfit)
  const stakes = settled.map((bet) => bet.stake)

  return {
    invested,
    profit,
    roi: CalcularROI(results, stakes),
    hitRate: settled.length ? (wins / settled.length) * 100 : 0,
    total: bets.length,
    pending: bets.filter((bet) => bet.status === 'pending').length,
  }
}

export const formatMoney = (value) =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
