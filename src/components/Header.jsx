import { Plus } from 'lucide-react'
import Logo from './Logo.jsx'

const titles = {
  profile: ['Mi perfil', 'Administra tu cuenta personal de BetIQ.'],
  dashboard: ['Resumen', 'Bitácora personal para llevar el control de tus registros.'],
  history: ['Registros', 'Edita, filtra o cambia el estado de cualquier movimiento en un clic.'],
  analytics: ['Estadísticas', 'Entiende tus números reales por deporte y rendimiento.'],
}

export default function Header({ page, onNewBet }) {
  const [title, subtitle] = titles[page] || titles.dashboard

  return (
    <header className="page-header">
      <div className="header-copy">
        <div className="mobile-brand-badge">
          <Logo compact />
        </div>
        <div>
          <p className="eyebrow">BETIQ · BITÁCORA PERSONAL</p>
          <h1>{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      <button type="button" className="primary-button header-action" onClick={onNewBet}>
        <Plus size={18} />
        <span>Nuevo registro</span>
      </button>
    </header>
  )
}
