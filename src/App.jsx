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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBet, setEditingBet] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets))
  }, [bets])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const showToast = (message, previousBets = null) => {
    setToast({ message, previousBets, id: Date.now() })
  }

  const handleUndo = () => {
    if (toast && toast.previousBets) {
      setBets(toast.previousBets)
      setToast({ message: 'Acción deshecha.', previousBets: null, id: Date.now() })
    }
  }

  const openNewBetModal = () => {
    setEditingBet(null)
    setIsModalOpen(true)
  }

  const openEditBetModal = (bet) => {
    setEditingBet(bet)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBet(null)
  }

  const saveBet = (betData) => {
    const previousBets = [...bets]
    const exists = bets.some((item) => item.id === betData.id)

    if (exists) {
      setBets((current) => current.map((item) => (item.id === betData.id ? betData : item)))
      showToast('Registro actualizado.', previousBets)
    } else {
      setBets((current) => [betData, ...current])
      showToast('Registro guardado en tu bitácora.', previousBets)
    }
    closeModal()
  }

  const updateStatus = (id, status) => {
    const target = bets.find((bet) => bet.id === id)
    if (!target || target.status === status) return
    const previousBets = [...bets]
    setBets((current) => current.map((bet) => (bet.id === id ? { ...bet, status } : bet)))
    showToast('Estado actualizado.', previousBets)
  }

  const deleteBet = (id) => {
    const previousBets = [...bets]
    setBets((current) => current.filter((bet) => bet.id !== id))
    showToast('Registro eliminado.', previousBets)
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewBet={openNewBetModal}
      />
      <main className="main-content">
        <Header page={page} onMenu={() => setMenuOpen(true)} onNewBet={openNewBetModal} />
        <div className="content-area">
          {page === 'dashboard' && (
            <Dashboard
              bets={bets}
              onNavigate={setPage}
              onNewBet={openNewBetModal}
              onEditBet={openEditBetModal}
              onUpdateStatus={updateStatus}
              onDelete={deleteBet}
            />
          )}
          {page === 'history' && (
            <History
              bets={bets}
              onUpdateStatus={updateStatus}
              onEditBet={openEditBetModal}
              onDelete={deleteBet}
              onNewBet={openNewBetModal}
            />
          )}
          {page === 'analytics' && <Analytics bets={bets} />}
        </div>
        <Footer />
      </main>
      {isModalOpen && (
        <NewBet
          initialBet={editingBet}
          onSave={saveBet}
          onCancel={closeModal}
        />
      )}
      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        <span>{toast ? toast.message : ''}</span>
        {toast && toast.previousBets && (
          <button type="button" className="toast-undo" onClick={handleUndo}>
            Deshacer
          </button>
        )}
      </div>
    </div>
  )
}
