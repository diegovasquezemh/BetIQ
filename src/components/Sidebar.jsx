import { BarChart3, History, LayoutDashboard, Plus, X } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'history', label: 'Registros', icon: History },
  { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
]

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose, onNewBet }) {
  const navigate = (page) => {
    onNavigate(page)
    onClose()
  }

  const handleQuickNew = () => {
    onClose()
    onNewBet()
  }

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <button type="button" className="sidebar-quick-add" onClick={handleQuickNew}>
          <Plus size={18} />
          <span>Nuevo registro</span>
        </button>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="nav-eyebrow">Bitácora</span>
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${currentPage === id ? 'is-active' : ''}`}
              onClick={() => navigate(id)}
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

      <nav className="mobile-bottom-nav" aria-label="Navegación rápida móvil">
        {links.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`mobile-nav-item ${currentPage === id ? 'is-active' : ''}`}
            onClick={() => navigate(id)}
          >
            <Icon size={19} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
        <button type="button" className="mobile-nav-item mobile-nav-add" onClick={handleQuickNew}>
          <Plus size={19} strokeWidth={2.4} />
          <span>Anotar</span>
        </button>
      </nav>
    </>
  )
}
