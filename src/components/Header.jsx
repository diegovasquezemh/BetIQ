import { Menu, Plus } from 'lucide-react'

const titles = {
  dashboard: ['Resumen', 'Bitácora personal para llevar el control de tus registros.'],
  history: ['Registros', 'Edita, filtra o cambia el estado de cualquier movimiento en un clic.'],
  analytics: ['Estadísticas', 'Entiende tus números reales por deporte y rendimiento.'],
}

export default function Header({ page, onMenu, onNewBet }) {
  const [title, subtitle] = titles[page] || titles.dashboard

  return (
    <header className="page-header">
      <div className="header-copy">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div>
          <p className="eyebrow">BETIQ · BITÁCORA PERSONAL</p>
          <h1>{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      <button className="primary-button header-action" onClick={onNewBet}>
        <Plus size={18} />
        <span>Nuevo registro</span>
      </button>
    </header>
  )
}
