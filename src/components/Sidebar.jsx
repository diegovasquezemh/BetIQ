import { BarChart3, History, LayoutDashboard, UserRound } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'history', label: 'Registros', icon: History },
  { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
  { id: 'profile', label: 'Mi perfil', icon: UserRound },
]

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Logo />
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="nav-eyebrow">Bitácora</span>
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-link ${currentPage === id ? 'is-active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-message">
          <span className="message-icon">iQ</span>
          <p><strong>Tu registro personal.</strong><br />Anota tus jugadas para conocer tu balance real sin suposiciones.</p>
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Navegación principal móvil">
        {links.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`mobile-nav-item ${currentPage === id ? 'is-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={20} strokeWidth={2.1} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
