import { Menu, Plus } from 'lucide-react'

const titles = {
  dashboard: ['Resumen', 'Tu rendimiento, sin términos complicados.'],
  'new-bet': ['Nueva apuesta', 'Registra cada movimiento en un solo lugar.'],
  history: ['Historial', 'Consulta y actualiza tus apuestas anteriores.'],
  analytics: ['Análisis', 'Encuentra patrones en tus decisiones.'],
}

export default function Header({ page, onMenu, onNewBet }) {
  const [title, subtitle] = titles[page]

  return (
    <header className="page-header">
      <div className="header-copy">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div>
          <p className="eyebrow">BETIQ CONTROL CENTER</p>
          <h1>{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      {page !== 'new-bet' && (
        <button className="primary-button header-action" onClick={onNewBet}>
          <Plus size={18} />
          Nueva apuesta
        </button>
      )}
    </header>
  )
}
