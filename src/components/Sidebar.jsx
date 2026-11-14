import { BarChart3, History, LayoutDashboard, PlusCircle, X } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'new-bet', label: 'Registrar apuesta', icon: PlusCircle },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'analytics', label: 'Análisis', icon: BarChart3 },
]

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const navigate = (page) => {
    onNavigate(page)
    onClose()
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

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <span className="nav-eyebrow">Mi espacio</span>
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
          <p><strong>Decide con datos.</strong><br />Nunca apuestes más de lo que puedes permitirte perder.</p>
        </div>
      </aside>
    </>
  )
}
