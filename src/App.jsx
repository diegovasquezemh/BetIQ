import { useEffect, useState } from 'react'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import { sampleBets } from './data/sampleBets.js'
import Analytics from './pages/Analytics.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import NewBet from './pages/NewBet.jsx'

const STORAGE_KEY = 'betiq-bets-v1'

function getInitialBets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    // Migra registros creados con la versión anterior del formulario.
    return saved
      ? JSON.parse(saved).map((bet) => ({
          modality: bet.type === 'COMBINADA' ? 'COMBINADA' : 'SIMPLE',
          moment: bet.type === 'EN VIVO' ? 'EN VIVO' : 'ANTES DEL EVENTO',
          ...bet,
        }))
      : sampleBets
  } catch {
    return sampleBets
  }
}

export default function App() {
  const [bets, setBets] = useState(getInitialBets)
  const [page, setPage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
  }, [bets])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const addBet = (bet) => {
    setBets((current) => [...current, bet])
    setPage('history')
    setToast('Apuesta registrada correctamente.')
  }

  const updateStatus = (id, status) => {
    setBets((current) => current.map((bet) => bet.id === id ? { ...bet, status } : bet))
    setToast('Resultado actualizado.')
  }

  const deleteBet = (id) => {
    if (!window.confirm('¿Quieres eliminar esta apuesta del historial?')) return
    setBets((current) => current.filter((bet) => bet.id !== id))
    setToast('Apuesta eliminada.')
  }

  return (
    <div className="app-shell">
      <Sidebar currentPage={page} onNavigate={setPage} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content">
        <Header page={page} onMenu={() => setMenuOpen(true)} onNewBet={() => setPage('new-bet')} />
        <div className="content-area">
          {page === 'dashboard' && <Dashboard bets={bets} onNavigate={setPage} />}
          {page === 'new-bet' && <NewBet onSave={addBet} onCancel={() => setPage('dashboard')} />}
          {page === 'history' && <History bets={bets} onUpdateStatus={updateStatus} onDelete={deleteBet} onNewBet={() => setPage('new-bet')} />}
          {page === 'analytics' && <Analytics bets={bets} />}
        </div>
        <Footer />
      </main>
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status">{toast}</div>
    </div>
  )
}
